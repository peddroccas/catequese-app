import { getErrorMessage } from '@/services/api'
import { RegistrationRepository } from '@/services/repositories/registrationRepository'
import { registration, registrationFile } from '@/Types'
import { formatFileSize } from '@/utils/registration'
import { Button } from '@nextui-org/react'
import { DownloadSimple, FileImage, FilePdf } from '@phosphor-icons/react'
import { saveAs } from 'file-saver'
import { useState } from 'react'

interface RegistrationDocumentsProps {
  registration: registration
}

// Documentos enviados na inscrição. O bucket é privado: cada arquivo abre por
// um link temporário gerado na hora
export function RegistrationDocuments({
  registration,
}: RegistrationDocumentsProps) {
  const [openingId, setOpeningId] = useState<string>()
  const [isZipping, setIsZipping] = useState(false)
  const [error, setError] = useState('')

  async function openFile(file: registrationFile) {
    setError('')
    setOpeningId(file.id)
    // A aba é aberta no clique (senão o navegador bloqueia) e recebe o link depois
    const tab = window.open('', '_blank')
    if (tab) {
      tab.opener = null
    }
    try {
      const url = await RegistrationRepository.getDocumentUrl(
        registration.id,
        file.id,
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
      setOpeningId(undefined)
    }
  }

  async function downloadZip() {
    setError('')
    setIsZipping(true)
    try {
      const blob = await RegistrationRepository.downloadZip(registration.id)
      saveAs(blob, `Inscricao - ${registration.name}.zip`)
    } catch (zipError) {
      setError(getErrorMessage(zipError))
    } finally {
      setIsZipping(false)
    }
  }

  if (!registration.files.length) {
    return <p className="text-sm text-bunker-500">Nenhum documento anexado.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y divide-bunker-100 rounded-xl border border-bunker-200 bg-white">
        {registration.files.map((file) => (
          <li
            key={file.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              {file.mimeType === 'application/pdf' ? (
                <FilePdf size={22} className="shrink-0 text-red-500" />
              ) : (
                <FileImage size={22} className="shrink-0 text-blue-600" />
              )}
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-bunker-900">
                  {file.label}
                </span>
                <span className="truncate text-xs text-bunker-500">
                  {file.originalName} · {formatFileSize(file.sizeBytes)}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="flat"
              isLoading={openingId === file.id}
              onPress={() => openFile(file)}
            >
              Abrir
            </Button>
          </li>
        ))}
      </ul>
      <Button
        size="sm"
        variant="flat"
        color="primary"
        className="self-start"
        startContent={<DownloadSimple size={16} />}
        isLoading={isZipping}
        onPress={downloadZip}
      >
        Baixar todos (ZIP)
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
