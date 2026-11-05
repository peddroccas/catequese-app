import { getErrorMessage } from '@/services/api'
import { RiteRepository } from '@/services/repositories/riteRepository'
import { rite, riteFile } from '@/Types'
import { optionalText, requiredText } from '@/utils/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
} from '@nextui-org/react'
import { FilePdf, Trash, UploadSimple, X } from '@phosphor-icons/react'
import { ChangeEvent, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const MAX_PDF_SIZE = 10 * 1024 * 1024
const MAX_FILES = 5

const riteFormSchema = z.object({
  name: requiredText(120),
  description: optionalText(500),
})

type RiteFormData = z.infer<typeof riteFormSchema>

interface RiteModalProps {
  data?: rite
  onClose: () => void
  onSaved: () => void
}

// Retorna a mensagem de erro se o arquivo não servir
function validatePdf(file: File) {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    return `${file.name}: o arquivo deve ser um PDF`
  }
  if (file.size > MAX_PDF_SIZE) {
    return `${file.name}: o PDF deve ter no máximo 10 MB`
  }
  return ''
}

// Cadastro e edição de rito, com os PDFs do roteiro (só a coordenação)
export function RiteModal({ data, onClose, onSaved }: RiteModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // PDFs escolhidos para enviar e PDFs atuais marcados para remover
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [fileError, setFileError] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')
  // Se o rito foi salvo mas um PDF falhou, o novo envio edita em vez de duplicar
  const [savedId, setSavedId] = useState<string | undefined>(data?.id)
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RiteFormData>({
    resolver: zodResolver(riteFormSchema),
    defaultValues: {
      name: data?.name ?? '',
      description: data?.description ?? '',
    },
  })

  const currentFiles: riteFile[] = (data?.files ?? []).filter(
    (file) => !removedIds.includes(file.id),
  )
  const totalFiles = currentFiles.length + newFiles.length

  function handleChooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!chosen.length) {
      return
    }
    const error = chosen.map(validatePdf).find(Boolean)
    if (error) {
      setFileError(error)
      return
    }
    if (totalFiles + chosen.length > MAX_FILES) {
      setFileError(`Cada rito pode ter no máximo ${MAX_FILES} PDFs`)
      return
    }
    setFileError('')
    setNewFiles((files) => [...files, ...chosen])
  }

  async function handleSubmitForm(form: RiteFormData) {
    setSubmitError('')
    const payload: rite = {
      id: savedId,
      name: form.name,
      description: form.description || null,
      files: [],
    }
    let changed = false
    try {
      let id = savedId
      if (id) {
        await RiteRepository.updateRite(payload)
      } else {
        const created = await RiteRepository.createRite(payload)
        id = created.id!
        setSavedId(id)
        changed = true
      }

      // Cada PDF concluído sai da lista, então uma nova tentativa só refaz o
      // que faltou
      for (const fileId of removedIds) {
        await RiteRepository.removeFile(id, fileId)
        changed = true
        setRemovedIds((ids) => ids.filter((item) => item !== fileId))
      }
      for (const file of newFiles) {
        await RiteRepository.uploadFile(id, file)
        changed = true
        setNewFiles((files) => files.filter((item) => item !== file))
      }
      onSaved()
      onClose()
    } catch (error) {
      // O rito (ou parte dos PDFs) pode ter sido salvo mesmo com a falha
      if (changed) {
        onSaved()
      }
      setSubmitError(getErrorMessage(error))
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="top"
      scrollBehavior="outside"
      className="py-2"
    >
      <ModalContent>
        <ModalHeader className="text-xl font-semibold text-bunker-900">
          {data ? 'Editar rito' : 'Novo rito'}
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  label="Nome do rito"
                  {...field}
                  isInvalid={Boolean(errors.name)}
                  errorMessage={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Descrição (opcional)"
                  minRows={2}
                  {...field}
                  isInvalid={Boolean(errors.description)}
                  errorMessage={errors.description?.message}
                />
              )}
            />

            <div className="flex flex-col gap-2 rounded-xl border border-bunker-200 bg-bunker-50/60 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
                PDFs do rito
              </span>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleChooseFiles}
              />
              {totalFiles === 0 && (
                <p className="text-sm text-bunker-500">
                  Nenhum PDF anexado (até {MAX_FILES}, de 10 MB cada).
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {currentFiles.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-2 text-sm text-bunker-800"
                  >
                    <FilePdf size={18} className="shrink-0 text-red-500" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <button
                      type="button"
                      aria-label={`Remover ${file.name}`}
                      onClick={() => setRemovedIds((ids) => [...ids, file.id])}
                      className="rounded-lg p-1 text-bunker-500 duration-150 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </li>
                ))}
                {newFiles.map((file) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center gap-2 text-sm text-bunker-800"
                  >
                    <FilePdf size={18} className="shrink-0 text-red-500" />
                    <span className="min-w-0 flex-1 truncate">
                      {file.name}{' '}
                      <span className="text-xs text-bunker-400">(novo)</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Descartar ${file.name}`}
                      onClick={() =>
                        setNewFiles((files) =>
                          files.filter((item) => item !== file),
                        )
                      }
                      className="rounded-lg p-1 text-bunker-500 duration-150 hover:bg-bunker-100 hover:text-bunker-800"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              {removedIds.length > 0 && (
                <p className="text-xs text-bunker-500">
                  {removedIds.length === 1
                    ? '1 PDF será removido'
                    : `${removedIds.length} PDFs serão removidos`}{' '}
                  ao salvar.{' '}
                  <button
                    type="button"
                    className="font-medium text-bunker-700 underline"
                    onClick={() => setRemovedIds([])}
                  >
                    Desfazer
                  </button>
                </p>
              )}
              {fileError && <p className="text-sm text-danger">{fileError}</p>}
              <div>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<UploadSimple size={16} />}
                  isDisabled={totalFiles >= MAX_FILES}
                  onPress={() => inputRef.current?.click()}
                >
                  Adicionar PDF
                </Button>
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-danger">{submitError}</p>
            )}

            <Button
              type="submit"
              size="lg"
              color="primary"
              className="w-full font-medium"
              isLoading={isSubmitting}
            >
              Salvar
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
