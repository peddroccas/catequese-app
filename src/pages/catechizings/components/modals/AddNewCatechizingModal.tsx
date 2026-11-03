import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { getErrorMessage } from '@/services/api'
import { useContext } from 'react'
import { CatechizingForm } from '../CatechizingForm'

interface AddNewCatechizingFormProps {
  isOpen: boolean
  onClose: () => void
  classroomId?: string
}

export function AddNewCatechizingModal({
  isOpen,
  onClose,
  classroomId,
}: AddNewCatechizingFormProps) {
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
          Adicionar Novo Catequizando
        </ModalHeader>
        <ModalBody>
          <CatechizingForm
            classroomId={classroomId}
            submitLabel="Cadastrar"
            onSubmit={async (catechizing) => {
              try {
                await CatechizingRepository.createNewCatechizing(catechizing)
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
