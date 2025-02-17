import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { classroom } from '@/Types'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import { useContext } from 'react'

interface DeleteClassroomFormModal {
  data: classroom
  isOpen: boolean
  onClose: () => void
}

export function DeleteClassroomModal({
  data,
  isOpen,
  onClose,
}: DeleteClassroomFormModal) {
  const { throwClassroomUpdate, throwCatechizingUpdate, throwCatechistUpdate } =
    useContext(ClassroomContext)
  async function handleDeleteClassroom() {
    try {
      await ClassroomRepository.deleteClassroom(data.id!)
        .then(() => {
          throwClassroomUpdate()
          throwCatechistUpdate()
        })
        .finally(() => {
          onClose()
        })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    data.catechists && (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="bg-bunker-900"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>Deseja realmente deletar turma?</ModalHeader>
          <ModalBody>
            <p>Turma: {data.roomNumber}</p>
            <p>Segmento: {data.segment}</p>
            <p>
              Catequistas:{' '}
              {data.catechists.map(catechist => catechist.name).join(' e ')}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={onClose}>
              Cancelar
            </Button>
            <Button color="danger" onClick={handleDeleteClassroom}>
              Deletar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  )
}
