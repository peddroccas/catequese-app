import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { catechizing } from '@/Types'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import { useContext } from 'react'

interface DeleteCatechizingFormModal {
  data: catechizing
  isOpen: boolean
  onClose: () => void
}

export function DeleteCatechizingModal({
  data,
  isOpen,
  onClose,
}: DeleteCatechizingFormModal) {
  const { throwClassroomUpdate, throwCatechizingUpdate } =
    useContext(ClassroomContext)
  async function handleDeletecatechizing() {
    try {
      await CatechizingRepository.deleteCatechizing(data.id!)
        .then(() => {
          throwCatechizingUpdate()
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
        <ModalHeader>Deseja realmente deletar catequizando?</ModalHeader>
        <ModalBody>{data.name}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={onClose}>
            Cancelar
          </Button>
          <Button color="danger" onClick={handleDeletecatechizing}>
            Deletar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
