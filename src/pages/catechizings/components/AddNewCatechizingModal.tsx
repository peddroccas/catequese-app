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
      className="flex w-11/12 flex-col rounded-xl bg-bunker-900 p-4 md:w-6/12 lg:w-5/12 2xl:w-3/12"
    >
      <ModalContent>
        <AddNewCatechizingForm />
      </ModalContent>
    </Modal>
  )
}
