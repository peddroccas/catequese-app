import { Modal, ModalContent, ModalHeader } from '@nextui-org/react'
import { AddNewCatechizingForm } from './AddNewCatechizingForm'

interface AddNewCatechizingFormProps {
  isOpen: boolean
  onClose: () => void
}

export function AddNewCatechizingModal({
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
          Adicionar Novo Catequizando
        </ModalHeader>
        <AddNewCatechizingForm />
      </ModalContent>
    </Modal>
  )
}
