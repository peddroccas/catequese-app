import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { catechizing } from '@/Types'
import { CatechizingForm } from '../CatechizingForm'

interface CatechizingInfoProps {
  data: catechizing
  isOpen: boolean
  onClose: () => void
}

export function CatechizingInfoModal({
  data,
  isOpen,
  onClose,
}: CatechizingInfoProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top"
      size="2xl"
      scrollBehavior="outside"
      className="rounded-xl bg-bunker-900 py-4"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          Catequizando
        </ModalHeader>
        <ModalBody>
          <CatechizingForm data={data} isReadOnly />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
