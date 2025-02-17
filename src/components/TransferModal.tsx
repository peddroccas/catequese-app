import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist, catechizing, classroom } from '@/Types'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react'
import { useContext, useState } from 'react'
import { ClassroomSelect } from './ClassroomSelect'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'

interface TransferModal {
  data: catechist | catechizing
  isOpen: boolean
  onClose: () => void
  type: 'catechist' | 'catechizing'
}

export function TransferModal({ data, isOpen, onClose, type }: TransferModal) {
  const {
    classrooms,
    throwClassroomUpdate,
    throwCatechistUpdate,
    throwCatechizingUpdate,
  } = useContext(ClassroomContext)

  const [selectedClassroom, setSelectedClassroom] = useState<classroom>(
    classrooms.find(classroom => classroom.id === data.classroomId)!
  )

  async function handleTransfer() {
    try {
      switch (type) {
        case 'catechist':
          // console.log(state)
          await CatechistRepository.transferCatechist(
            data.id!,
            selectedClassroom.id!
          )
            .then(() => {
              throwCatechistUpdate()
              throwClassroomUpdate()
            })
            .finally(() => {
              onClose()
            })
          break
        case 'catechizing':
          await CatechizingRepository.transferCatechizing(
            data.id!,
            selectedClassroom.id!
          )
            .then(() => {
              throwCatechizingUpdate()
              throwClassroomUpdate()
            })
            .finally(() => {
              onClose()
            })
          break
        default:
          break
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onClose={() => {
        onClose()
        setSelectedClassroom(
          classrooms.find(classroom => classroom.id === data.classroomId)!
        )
      }}
      className="bg-bunker-900"
    >
      <ModalContent>
        <ModalHeader>Transferência de turma</ModalHeader>
        <ModalBody>
          <p>Nome: {data.name}</p>
          <p>
            Turma:{' '}
            {classrooms.find(classroom => classroom.id === data.classroomId)
              ?.roomNumber || 'Sem turma'}
          </p>
          <ClassroomSelect
            value={selectedClassroom || ({} as classroom)}
            onChange={e =>
              setSelectedClassroom(
                classrooms.find(classroom => classroom.id === e.target.value)!
              )
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={handleTransfer}
            isDisabled={!selectedClassroom}
          >
            Transferir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
