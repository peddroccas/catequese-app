import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { getErrorMessage } from '@/services/api'
import { catechist } from '@/Types'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import { useState } from 'react'

interface ResetPasswordModalProps {
  data: catechist
  isOpen: boolean
  onClose: () => void
}

export function ResetPasswordModal({
  data,
  isOpen,
  onClose,
}: ResetPasswordModalProps) {
  const [isResetting, setIsResetting] = useState<boolean>(false)

  async function handleResetPassword() {
    setIsResetting(true)
    try {
      await CatechistRepository.resetPassword(data.id!)
      alert(`Senha de ${data.name} voltou para 123456`)
      onClose()
    } catch (error) {
      alert(getErrorMessage(error))
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader>Resetar senha?</ModalHeader>
        <ModalBody>
          <p>
            A senha de <strong>{data.name}</strong> volta para{' '}
            <strong>123456</strong> e a troca será pedida no próximo acesso.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="danger"
            onPress={handleResetPassword}
            isLoading={isResetting}
          >
            Resetar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
