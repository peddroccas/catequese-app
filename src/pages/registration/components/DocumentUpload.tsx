import { documentKind } from '@/Types'
import {
  MAX_PDF_SIZE,
  documentHints,
  documentLabels,
  formatFileSize,
} from '@/utils/registration'
import { Button, CircularProgress } from '@nextui-org/react'
import { CheckCircle, FileArrowUp, Trash } from '@phosphor-icons/react'
import { useRef, useState } from 'react'

export interface preparedDocument {
  blob: Blob
  // Nome mostrado e enviado
  name: string
  size: number
}

interface DocumentUploadProps {
  kind: documentKind
  // Sobrescrevem o texto padrão (que muda conforme a etapa)
  label?: string
  hint?: string
  value?: preparedDocument
  error?: string
  onChange: (document: preparedDocument | undefined) => void
  onError: (message: string) => void
}

function isPdf(file: File) {
  // Alguns navegadores e celulares não informam o tipo: confere também a extensão
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

// Só PDF, com limite de tamanho (a API confere de novo pelo conteúdo)
function prepareDocument(file: File): preparedDocument {
  if (!isPdf(file)) {
    throw new Error(
      'Envie o documento em PDF. Dica: o app de notas do iPhone, o Google Drive e o Adobe Scan transformam a foto em PDF',
    )
  }
  if (file.size > MAX_PDF_SIZE) {
    throw new Error(
      `O PDF tem ${formatFileSize(file.size)}. O máximo é ${formatFileSize(MAX_PDF_SIZE)}; envie um PDF mais leve`,
    )
  }
  return { blob: file, name: file.name, size: file.size }
}

export function DocumentUpload({
  kind,
  label = documentLabels[kind],
  hint = documentHints[kind],
  value,
  error,
  onChange,
  onError,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  function handleFile(file?: File) {
    if (!file) {
      return
    }
    setIsProcessing(true)
    try {
      onChange(prepareDocument(file))
    } catch (processingError) {
      onChange(undefined)
      onError(
        processingError instanceof Error
          ? processingError.message
          : 'Não foi possível usar este arquivo',
      )
    } finally {
      setIsProcessing(false)
      // Permite escolher o mesmo arquivo de novo
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div
      data-invalid={Boolean(error)}
      className={`flex flex-col gap-2 rounded-xl border bg-white p-4 ${error ? 'border-danger' : 'border-bunker-200'}`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-bunker-900">{label}</span>
        {hint && <span className="text-xs text-bunker-500">{hint}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {isProcessing ? (
        <div className="flex items-center gap-2 text-sm text-bunker-500">
          <CircularProgress size="sm" aria-label="Processando" />
          Preparando o arquivo...
        </div>
      ) : value ? (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm text-emerald-800">
            <CheckCircle size={18} weight="fill" className="shrink-0" />
            <span className="truncate">{value.name}</span>
            <span className="shrink-0 text-xs text-emerald-700">
              {formatFileSize(value.size)}
            </span>
          </span>
          <span className="flex shrink-0 gap-1">
            <Button
              size="sm"
              variant="light"
              onPress={() => inputRef.current?.click()}
            >
              Trocar
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label="Remover arquivo"
              onPress={() => onChange(undefined)}
            >
              <Trash size={16} className="text-red-400" />
            </Button>
          </span>
        </div>
      ) : (
        <Button
          variant="flat"
          color="primary"
          className="self-start"
          startContent={<FileArrowUp size={18} />}
          onPress={() => inputRef.current?.click()}
        >
          Enviar PDF
        </Button>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
