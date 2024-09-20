import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist, catechizing } from '@/Types'
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

interface TransferModal {
  data: catechist | catechizing
  isOpen: boolean
  onClose: () => void
  type: 'catechist' | 'catechizing'
}

export function TransferModal({ data, isOpen, onClose, type }: TransferModal) {
  const { classrooms, throwClassroomUpdate, throwCatechistUpdate } =
    useContext(ClassroomContext)

  const [selectedClassroom, setSelectedClassroom] = useState<{
    id: string
    classroomName: string
    startedAt: number
  }>(classrooms.find((classroom) => classroom.id === data.classroomId)!)

  async function handleTransfer() {
    try {
      switch (type) {
        case 'catechist':
          // console.log(state)
          await CatechistRepository.transferCatechist(
            data.id!,
            selectedClassroom.id,
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
      onClose={() => {
        onClose()
        setSelectedClassroom(
          classrooms.find((classroom) => classroom.id === data.classroomId)!,
        )
      }}
      className="bg-bunker-900"
    >
      <ModalContent>
        <ModalHeader>Transferência de turma</ModalHeader>
        <ModalBody>
          <p>Nome: {data.name}</p>
          <p>Turma: {data.classroomId}</p>
          <ClassroomSelect
            value={selectedClassroom!}
            onChange={(e) =>
              setSelectedClassroom(
                classrooms.find(
                  (classroom) => classroom.id === e.target.value,
                )!,
              )
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={onClose}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleTransfer}>
            Transferir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
