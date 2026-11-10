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
import { TemporaryPasswordNotice } from '../TemporaryPasswordNotice'

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
  // Preenchido depois do reset: a senha temporária só aparece uma vez
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  )

  async function handleResetPassword() {
    setIsResetting(true)
    try {
      const response = await CatechistRepository.resetPassword(data.id!)
      setTemporaryPassword(response.temporaryPassword)
    } catch (error) {
      alert(getErrorMessage(error))
    } finally {
      setIsResetting(false)
    }
  }

  function handleClose() {
    setTemporaryPassword(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      isDismissable={!temporaryPassword}
    >
      <ModalContent>
        <ModalHeader>
          {temporaryPassword ? 'Senha resetada' : 'Resetar senha?'}
        </ModalHeader>
        <ModalBody>
          {temporaryPassword ? (
            <TemporaryPasswordNotice
              name={data.name}
              password={temporaryPassword}
            />
          ) : (
            <p>
              A senha de <strong>{data.name}</strong> será trocada por uma senha
              temporária nova, mostrada uma única vez. A troca será pedida no
              próximo acesso.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          {temporaryPassword ? (
            <Button color="primary" onPress={handleClose}>
              Concluir
            </Button>
          ) : (
            <>
              <Button color="primary" onPress={handleClose}>
                Cancelar
              </Button>
              <Button
                color="danger"
                onPress={handleResetPassword}
                isLoading={isResetting}
              >
                Resetar
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
