import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { getErrorMessage } from '@/services/api'
import { catechizing } from '@/Types'
import { useContext } from 'react'
import { CatechizingForm } from '../CatechizingForm'

interface EditCatechizingModalProps {
  data: catechizing
  isOpen: boolean
  onClose: () => void
}

export function EditCatechizingModal({
  data,
  isOpen,
  onClose,
}: EditCatechizingModalProps) {
  const { throwClassroomUpdate, throwCatechizingUpdate } =
    useContext(ClassroomContext)

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
          Editar Catequizando
        </ModalHeader>
        <ModalBody>
          <CatechizingForm
            data={data}
            onSubmit={async (catechizing) => {
              try {
                await CatechizingRepository.updateCatechizing(catechizing)
              } catch (error) {
                throw new Error(getErrorMessage(error))
              }
              throwCatechizingUpdate()
              throwClassroomUpdate()
              onClose()
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
