import { ClassroomContext } from '@/contexts/ClassroomContext'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import {
  downloadImportTemplate,
  ImportFileError,
  ImportRow,
  MAX_ROWS_PER_REQUEST,
  parseImportFile,
} from '@/utils/importCatechizings'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { ChangeEvent, useContext, useState } from 'react'

interface ImportCatechizingsModalProps {
  isOpen: boolean
  onClose: () => void
  onImported: () => void
}

interface RowFailure {
  sourceRow: number
  name: string
  error: string
}

interface Summary {
  total: number
  imported: number
  failures: RowFailure[]
}

// Cadastro em lote: baixa o modelo, lê a planilha preenchida e mostra, linha
// a linha, o que entrou e o que precisa ser corrigido
export function ImportCatechizingsModal({
  isOpen,
  onClose,
  onImported,
}: ImportCatechizingsModalProps) {
  const { classrooms } = useContext(ClassroomContext)
  const [rows, setRows] = useState<ImportRow[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [defaultClassroomId, setDefaultClassroomId] = useState('')
  const [isReading, setIsReading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)

  function reset() {
    setRows(null)
    setFileName('')
    setSummary(null)
  }

  function handleClose() {
    reset()
    setDefaultClassroomId('')
    onClose()
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setIsReading(true)
    try {
      const parsed = await parseImportFile(file)
      if (parsed.length === 0) {
        toast.error('Não encontrei nenhum catequizando na planilha.')
        return
      }
      setRows(parsed)
      setFileName(file.name)
      setSummary(null)
    } catch (error) {
      toast.error(
        error instanceof ImportFileError
          ? error.message
          : 'Não foi possível ler a planilha.',
      )
    } finally {
      setIsReading(false)
    }
  }

  async function handleImport() {
    if (!rows) return
    setIsImporting(true)
    const failures: RowFailure[] = []
    let imported = 0
    try {
      // A API recebe até 500 linhas por vez
      for (let start = 0; start < rows.length; start += MAX_ROWS_PER_REQUEST) {
        const chunk = rows.slice(start, start + MAX_ROWS_PER_REQUEST)
        const payload = chunk.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ sourceRow, ...row }) => row,
        )
        const result = await CatechizingRepository.importMany(
          payload,
          defaultClassroomId || undefined,
        )
        imported += result.imported
        for (const item of result.results) {
          if (!item.ok) {
            const source = chunk[item.row - 1]
            failures.push({
              sourceRow: source.sourceRow,
              name: source.name,
              error: item.error ?? 'Erro desconhecido',
            })
          }
        }
      }
      setSummary({ total: rows.length, imported, failures })
      if (imported > 0) onImported()
    } catch (error) {
      toast.error(getErrorMessage(error))
      // Parte pode ter entrado antes do erro
      if (imported > 0) onImported()
    } finally {
      setIsImporting(false)
    }
  }

  const needsClassroom = rows?.some((row) => !row.classroom) ?? false

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="top"
      size="2xl"
      scrollBehavior="inside"
      isDismissable={!isImporting}
    >
      <ModalContent>
        <ModalHeader>Importar catequizandos por planilha</ModalHeader>
        <ModalBody className="gap-4 text-sm text-bunker-700">
          {summary ? (
            <>
              <p>
                <strong>{summary.imported}</strong> de {summary.total} entraram
                {summary.failures.length > 0 &&
                  `; ${summary.failures.length} precisam de correção:`}
                {summary.failures.length === 0 && '. Tudo certo!'}
              </p>
              {summary.failures.length > 0 && (
                <>
                  <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border border-bunker-200 bg-bunker-50 p-3">
                    {summary.failures.map((failure) => (
                      <li key={failure.sourceRow}>
                        <span className="font-medium">
                          Linha {failure.sourceRow}
                        </span>
                        {failure.name && ` (${failure.name})`}:{' '}
                        <span className="text-danger">{failure.error}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-bunker-500">
                    Corrija só essas linhas na planilha e importe de novo: quem
                    já entrou é reconhecido (mesmo nome e nascimento) e não é
                    duplicado.
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <p>
                1. Baixe o modelo, preencha uma linha por catequizando e salve
                como .xlsx. 2. Escolha o arquivo aqui.
              </p>
              <div>
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={() => downloadImportTemplate()}
                >
                  Baixar modelo da planilha
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="import-file"
                  className="text-xs font-semibold uppercase tracking-wide text-bunker-500"
                >
                  Arquivo preenchido
                </label>
                <input
                  id="import-file"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFile}
                  disabled={isReading || isImporting}
                  className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-bunker-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-bunker-800 hover:file:bg-bunker-200"
                />
              </div>
              {rows && (
                <>
                  <p className="rounded-lg bg-bunker-50 p-3">
                    <strong>{fileName}</strong>: {rows.length} catequizando
                    {rows.length === 1 ? '' : 's'} encontrado
                    {rows.length === 1 ? '' : 's'}. As linhas com problema são
                    listadas depois; o resto entra normalmente.
                  </p>
                  {needsClassroom && (
                    <Select
                      label="Turma das linhas sem turma"
                      variant="bordered"
                      selectedKeys={
                        defaultClassroomId ? [defaultClassroomId] : []
                      }
                      onChange={(event) =>
                        setDefaultClassroomId(event.target.value)
                      }
                      description="Algumas linhas não têm turma na planilha"
                    >
                      {classrooms
                        .filter((classroom) => classroom.id)
                        .map((classroom) => (
                          <SelectItem key={classroom.id as string}>
                            {classroom.location}
                          </SelectItem>
                        ))}
                    </Select>
                  )}
                </>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {summary ? (
            <>
              {summary.failures.length > 0 && (
                <Button variant="light" onPress={reset}>
                  Importar outro arquivo
                </Button>
              )}
              <Button color="primary" onPress={handleClose}>
                Concluir
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="light"
                onPress={handleClose}
                isDisabled={isImporting}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleImport}
                isLoading={isImporting}
                isDisabled={!rows || isReading}
              >
                {rows ? `Importar ${rows.length}` : 'Importar'}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
