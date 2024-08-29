import { Modal, ModalContent } from '@nextui-org/react'
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
      className="flex flex-col rounded-xl bg-bunker-900 p-4"
    >
      <ModalContent>
        <AddNewCatechizingForm />
      </ModalContent>
    </Modal>
  )
}
