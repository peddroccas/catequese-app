import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { getErrorMessage } from '@/services/api'
import { useContext, useState } from 'react'
import { CatechistForm } from '../CatechistForm'
import { TemporaryPasswordNotice } from '../TemporaryPasswordNotice'

interface AddNewCatechistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddNewCatechistModal({
  isOpen,
  onClose,
}: AddNewCatechistModalProps) {
  const { throwCatechistUpdate, throwClassroomUpdate } =
    useContext(ClassroomContext)
  // Preenchido depois de cadastrar: a senha temporária só aparece uma vez
  const [created, setCreated] = useState<{
    name: string
    temporaryPassword: string
  } | null>(null)

  function handleClose() {
    setCreated(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="top"
      size="2xl"
      scrollBehavior="outside"
      className="py-2"
      isDismissable={!created}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-xl font-semibold text-bunker-900">
          {created ? 'Catequista cadastrado' : 'Adicionar Novo Catequista'}
          {!created && (
            <span className="text-sm font-normal text-bunker-500">
              Uma senha temporária é gerada ao cadastrar; no primeiro acesso
              será pedida a troca.
            </span>
          )}
        </ModalHeader>
        {created ? (
          <>
            <ModalBody>
              <TemporaryPasswordNotice
                name={created.name}
                password={created.temporaryPassword}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleClose}>
                Concluir
              </Button>
            </ModalFooter>
          </>
        ) : (
          <ModalBody>
            <CatechistForm
              submitLabel="Cadastrar"
              onSubmit={async (catechist) => {
                let response
                try {
                  response =
                    await CatechistRepository.createNewCatechist(catechist)
                } catch (error) {
                  throw new Error(getErrorMessage(error))
                }
                throwCatechistUpdate()
                throwClassroomUpdate()
                setCreated({
                  name: catechist.name,
                  temporaryPassword: response.temporaryPassword,
                })
              }}
            />
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}
