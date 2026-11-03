import { getErrorMessage } from '@/services/api'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import { ReactNode, useState } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  confirmLabel: string
  // danger para ações destrutivas (excluir de vez)
  color?: 'primary' | 'danger'
  onConfirm: () => Promise<void>
}

// Confirmação padrão para arquivar, restaurar e excluir
export function ConfirmModal({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel,
  color = 'primary',
  onConfirm,
}: ConfirmModalProps) {
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  async function handleConfirm() {
    setIsConfirming(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader className="text-lg font-semibold text-bunker-900">
          {title}
        </ModalHeader>
        <ModalBody className="text-sm text-bunker-700">
          {children}
          {error && <p className="text-danger">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color={color}
            onPress={handleConfirm}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
