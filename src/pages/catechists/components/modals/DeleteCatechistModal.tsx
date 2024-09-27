import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist } from '@/Types'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import { useContext } from 'react'

interface DeleteCatechistFormModal {
  data: catechist
  isOpen: boolean
  onClose: () => void
}

export function DeleteCatechistModal({
  data,
  isOpen,
  onClose,
}: DeleteCatechistFormModal) {
  const { classrooms, throwClassroomUpdate, throwCatechistUpdate } =
    useContext(ClassroomContext)
  async function handleDeleteCatechist() {
    try {
      await CatechistRepository.deleteCatechist(data.id!)
        .then(() => {
          throwCatechistUpdate()
          throwClassroomUpdate()
        })
        .finally(() => {
          onClose()
        })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="bg-bunker-900">
      <ModalContent>
        <ModalHeader>Deseja realmente deletar catequista?</ModalHeader>
        <ModalBody>{data.name}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={onClose}>
            Cancelar
          </Button>
          <Button color="danger" onClick={handleDeleteCatechist}>
            Deletar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
