import { ConfirmModal } from '@/components/ConfirmModal'
import { getErrorMessage } from '@/services/api'
import { CatechizingDocumentRepository } from '@/services/repositories/catechizingDocumentRepository'
import { catechizing, catechizingDocument, documentKind } from '@/Types'
import { formatTimestamp } from '@/utils/date'
import {
  MAX_PDF_SIZE,
  documentLabels,
  formatFileSize,
} from '@/utils/registration'
import { Button, Select, SelectItem } from '@nextui-org/react'
import { DownloadSimple, FilePdf } from '@phosphor-icons/react'
import { saveAs } from 'file-saver'
import { useCallback, useEffect, useRef, useState } from 'react'

interface CatechizingDocumentsProps {
  catechizing: catechizing
  // Só consulta (abrir e baixar). Cadastrar, trocar e remover ficam no editar
  isReadOnly?: boolean
}

const allKinds = Object.keys(documentLabels) as documentKind[]

// Documentos do catequizando (RG, certidões, lembranças...). Só a coordenação
// vê esta parte: cadastra, troca o arquivo e remove
export function CatechizingDocuments({
  catechizing,
  isReadOnly,
}: CatechizingDocumentsProps) {
  const catechizingId = catechizing.id!
  const [documents, setDocuments] = useState<catechizingDocument[]>()
  const [busyKey, setBusyKey] = useState<string>()
  const [removing, setRemoving] = useState<catechizingDocument>()
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  // Para qual tipo o arquivo escolhido vai (novo ou troca)
  const pendingKind = useRef<documentKind>()

  const load = useCallback(() => {
    CatechizingDocumentRepository.getAll(catechizingId)
      .then(setDocuments)
      .catch((loadError) => setError(getErrorMessage(loadError)))
  }, [catechizingId])

  useEffect(() => {
    load()
  }, [load])

  function chooseFile(kind: documentKind) {
    setError('')
    pendingKind.current = kind
    inputRef.current?.click()
  }

  async function handleFile(file?: File) {
    const kind = pendingKind.current
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    if (!file || !kind) {
      return
    }
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setError('Envie o documento em PDF')
      return
    }
    if (file.size > MAX_PDF_SIZE) {
      setError(
        `O PDF tem ${formatFileSize(file.size)}. O máximo é ${formatFileSize(MAX_PDF_SIZE)}`,
      )
      return
    }

    setBusyKey(kind)
    try {
      await CatechizingDocumentRepository.upload(catechizingId, kind, file)
      load()
    } catch (uploadError) {
      setError(getErrorMessage(uploadError))
    } finally {
      setBusyKey(undefined)
    }
  }

  async function openDocument(document: catechizingDocument) {
    setError('')
    setBusyKey(document.id)
    // A aba é aberta no clique (senão o navegador bloqueia) e recebe o link depois
    const tab = window.open('', '_blank')
    if (tab) {
      tab.opener = null
    }
    try {
      const url = await CatechizingDocumentRepository.getUrl(
        catechizingId,
        document.id,
      )
      if (tab) {
        tab.location.href = url
      } else {
        window.location.href = url
      }
    } catch (openError) {
      tab?.close()
      setError(getErrorMessage(openError))
    } finally {
      setBusyKey(undefined)
    }
  }

  async function downloadZip() {
    setError('')
    setBusyKey('zip')
    try {
      const blob =
        await CatechizingDocumentRepository.downloadZip(catechizingId)
      saveAs(blob, `Documentos - ${catechizing.name}.zip`)
    } catch (zipError) {
      setError(getErrorMessage(zipError))
    } finally {
      setBusyKey(undefined)
    }
  }

  const sentKinds = new Set((documents ?? []).map((document) => document.kind))
  const missingKinds = allKinds.filter((kind) => !sentKinds.has(kind))

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
        Documentos
      </h3>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <ConfirmModal
        isOpen={Boolean(removing)}
        onClose={() => setRemoving(undefined)}
        title="Remover documento?"
        confirmLabel="Remover"
        color="danger"
        onConfirm={async () => {
          try {
            await CatechizingDocumentRepository.remove(
              catechizingId,
              removing!.id,
            )
          } catch (removeError) {
            throw new Error(getErrorMessage(removeError))
          }
          load()
        }}
      >
        <p>
          Remover <strong>{removing?.label}</strong> de{' '}
          <strong>{catechizing.name}</strong>? O arquivo é apagado.
        </p>
      </ConfirmModal>

      {documents === undefined ? (
        !error && <p className="text-sm text-bunker-500">Carregando...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-bunker-500">Nenhum documento cadastrado.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-bunker-100 rounded-xl border border-bunker-200 bg-white">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FilePdf size={22} className="shrink-0 text-red-500" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-bunker-900">
                    {document.label}
                  </span>
                  <span className="truncate text-xs text-bunker-500">
                    {document.originalName} ·{' '}
                    {formatFileSize(document.sizeBytes)} · enviado em{' '}
                    {formatTimestamp(document.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="sm"
                  variant="flat"
                  isLoading={busyKey === document.id}
                  onPress={() => openDocument(document)}
                >
                  Abrir
                </Button>
                {!isReadOnly && (
                  <>
                    <Button
                      size="sm"
                      variant="light"
                      isLoading={busyKey === document.kind}
                      onPress={() => chooseFile(document.kind)}
                    >
                      Trocar
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => setRemoving(document)}
                    >
                      Remover
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {!isReadOnly && missingKinds.length > 0 && (
          <Select
            aria-label="Adicionar documento"
            placeholder="Adicionar documento (PDF)"
            size="sm"
            className="sm:max-w-xs"
            classNames={{
              listbox: 'text-bunker-800',
              selectorIcon: 'text-bunker-500',
            }}
            selectedKeys={[]}
            isDisabled={busyKey !== undefined}
            onChange={(event) => {
              if (event.target.value) {
                chooseFile(event.target.value as documentKind)
              }
            }}
          >
            {missingKinds.map((kind) => (
              <SelectItem key={kind}>{documentLabels[kind]}</SelectItem>
            ))}
          </Select>
        )}
        {documents && documents.length > 0 && (
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<DownloadSimple size={16} />}
            isLoading={busyKey === 'zip'}
            onPress={downloadZip}
          >
            Baixar todos (ZIP)
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </section>
  )
}
