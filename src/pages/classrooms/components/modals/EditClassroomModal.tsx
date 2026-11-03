import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { getErrorMessage } from '@/services/api'
import { classroom } from '@/Types'
import { useContext } from 'react'
import { ClassroomForm } from '../ClassroomForm'

interface EditClassroomModalProps {
  data: classroom
  isOpen: boolean
  onClose: () => void
}

export function EditClassroomModal({
  data,
  isOpen,
  onClose,
}: EditClassroomModalProps) {
  const { throwClassroomUpdate, throwCatechistUpdate } =
    useContext(ClassroomContext)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="rounded-xl bg-bunker-900 py-4"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          Editar Turma
        </ModalHeader>
        <ModalBody>
          <ClassroomForm
            data={data}
            submitLabel="Salvar"
            onSubmit={async (classroom) => {
              try {
                await ClassroomRepository.editClassroom(classroom)
              } catch (error) {
                throw new Error(getErrorMessage(error))
              }
              throwClassroomUpdate()
              throwCatechistUpdate()
              onClose()
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
