import { getErrorMessage } from '@/services/api'
import {
  describeSkipped,
  packageFormat,
  packageResult,
} from '@/utils/registrationPdf'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react'
import { CaretDown, Files } from '@phosphor-icons/react'
import { useState } from 'react'

interface PackageMenuProps {
  onDownload: (format: packageFormat) => Promise<packageResult>
}

// "Ficha + documentos": um PDF só (bom para imprimir) ou um ZIP com os
// arquivos separados. Só a coordenação usa
export function PackageMenu({ onDownload }: PackageMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function download(format: packageFormat) {
    setMessage('')
    setIsLoading(true)
    try {
      const result = await onDownload(format)
      if (!result.hadDocuments) {
        setMessage('Ainda não há documentos: baixei só a ficha.')
      } else if (result.skipped.length) {
        setMessage(describeSkipped(result.skipped))
      }
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="flat"
            color="primary"
            startContent={<Files size={18} />}
            endContent={<CaretDown size={14} />}
            isLoading={isLoading}
          >
            Ficha + documentos
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Ficha e documentos"
          onAction={(key) => download(key as packageFormat)}
        >
          <DropdownItem
            key="pdf"
            description="Ficha e documentos num arquivo só, para imprimir"
          >
            PDF único
          </DropdownItem>
          <DropdownItem key="zip" description="Cada documento em um arquivo">
            ZIP (arquivos separados)
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      {message && <p className="max-w-xs text-xs text-bunker-500">{message}</p>}
    </div>
  )
}
