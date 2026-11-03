import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { getErrorMessage } from '@/services/api'
import { catechist } from '@/Types'
import { useContext } from 'react'
import { CatechistForm } from '../CatechistForm'
import { useAuth } from '@/hooks/useAuth'

interface EditCatechistModalProps {
  data: catechist
  isOpen: boolean
  onClose: () => void
}

export function EditCatechistModal({
  data,
  isOpen,
  onClose,
}: EditCatechistModalProps) {
  const { user, refreshUser } = useAuth()
  const { throwCatechistUpdate, throwClassroomUpdate } =
    useContext(ClassroomContext)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top"
      size="2xl"
      scrollBehavior="outside"
      className="py-2"
    >
      <ModalContent>
        <ModalHeader className="text-xl font-semibold text-bunker-900">
          Editar Catequista
        </ModalHeader>
        <ModalBody>
          <CatechistForm
            data={data}
            onSubmit={async (catechist) => {
              try {
                await CatechistRepository.updateCatechist(catechist)
              } catch (error) {
                throw new Error(getErrorMessage(error))
              }
              throwCatechistUpdate()
              throwClassroomUpdate()
              if (catechist.id === user?.id) {
                await refreshUser()
              }
              onClose()
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
