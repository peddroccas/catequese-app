import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { getErrorMessage } from '@/services/api'
import { useContext } from 'react'
import { ClassroomForm } from '../ClassroomForm'

interface AddNewClassroomModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddNewClassroomModal({
  isOpen,
  onClose,
}: AddNewClassroomModalProps) {
  const { throwClassroomUpdate, throwCatechistUpdate } =
    useContext(ClassroomContext)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="py-2"
    >
      <ModalContent>
        <ModalHeader className="text-xl font-semibold text-bunker-900">
          Adicionar Nova Turma
        </ModalHeader>
        <ModalBody>
          <ClassroomForm
            submitLabel="Cadastrar"
            onSubmit={async (classroom) => {
              try {
                await ClassroomRepository.createNewClassroom(classroom)
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
