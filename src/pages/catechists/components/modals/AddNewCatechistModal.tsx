import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { getErrorMessage } from '@/services/api'
import { useContext } from 'react'
import { CatechistForm } from '../CatechistForm'

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top"
      size="2xl"
      scrollBehavior="outside"
      className="rounded-xl bg-bunker-900 py-2"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-1 text-xl">
          Adicionar Novo Catequista
          <span className="text-sm font-normal text-bunker-300">
            A senha inicial é 123456; no primeiro acesso será pedida a troca.
          </span>
        </ModalHeader>
        <ModalBody>
          <CatechistForm
            submitLabel="Cadastrar"
            onSubmit={async (catechist) => {
              try {
                await CatechistRepository.createNewCatechist(catechist)
              } catch (error) {
                throw new Error(getErrorMessage(error))
              }
              throwCatechistUpdate()
              throwClassroomUpdate()
              onClose()
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
