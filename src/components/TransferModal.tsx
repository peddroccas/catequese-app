import { ClassroomContext } from '@/contexts/ClassroomContext'
import { catechizing, classroom } from '@/Types'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import { useContext, useState } from 'react'
import { ClassroomSelect } from './ClassroomSelect'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { getErrorMessage } from '@/services/api'

interface TransferModalProps {
  data: catechizing
  isOpen: boolean
  onClose: () => void
}

export function TransferModal({ data, isOpen, onClose }: TransferModalProps) {
  const { classrooms, throwClassroomUpdate, throwCatechizingUpdate } =
    useContext(ClassroomContext)

  const currentClassroom = classrooms.find(
    (classroom) => classroom.id === data.classroomId,
  )
  const [selectedClassroom, setSelectedClassroom] = useState<
    classroom | undefined
  >(currentClassroom)
  const [isTransferring, setIsTransferring] = useState<boolean>(false)

  async function handleTransfer() {
    setIsTransferring(true)
    try {
      await CatechizingRepository.transferCatechizing(
        data.id!,
        selectedClassroom!.id!,
      )
      throwCatechizingUpdate()
      throwClassroomUpdate()
      onClose()
    } catch (error) {
      alert(getErrorMessage(error))
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onClose={() => {
        onClose()
        setSelectedClassroom(currentClassroom)
      }}
    >
      <ModalContent>
        <ModalHeader>Transferência de turma</ModalHeader>
        <ModalBody>
          <p>Nome: {data.name}</p>
          <p>Turma: {currentClassroom?.name || 'Sem turma'}</p>
          <ClassroomSelect
            value={selectedClassroom || ({} as classroom)}
            onChange={(e) =>
              setSelectedClassroom(
                classrooms.find((classroom) => classroom.id === e.target.value),
              )
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleTransfer}
            isLoading={isTransferring}
            isDisabled={
              !selectedClassroom || selectedClassroom.id === data.classroomId
            }
          >
            Transferir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
