import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { AddNewClassroomForm } from './AddNewClassroomForm'

interface AddNewCatechizingFormProps {
  isOpen: boolean
  onClose: () => void
}

export function AddNewClassroomModal({
  isOpen,
  onClose,
}: AddNewCatechizingFormProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="flex w-9/12 flex-col rounded-xl bg-bunker-900 py-4 md:w-5/12 lg:w-3/12 2xl:w-3/12"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          Adicionar Novo Turma
        </ModalHeader>
        <ModalBody>
          <AddNewClassroomForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
