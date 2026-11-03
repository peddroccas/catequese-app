import { ConfirmModal } from '@/components/ConfirmModal'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist } from '@/Types'
import { useContext } from 'react'

interface ArchiveCatechistModalProps {
  data: catechist
  isOpen: boolean
  onClose: () => void
}

export function ArchiveCatechistModal({
  data,
  isOpen,
  onClose,
}: ArchiveCatechistModalProps) {
  const { throwCatechistUpdate, throwClassroomUpdate } =
    useContext(ClassroomContext)

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Arquivar catequista?"
      confirmLabel="Arquivar"
      onConfirm={async () => {
        await CatechistRepository.archiveCatechist(data.id!)
        throwCatechistUpdate()
        throwClassroomUpdate()
      }}
    >
      <p>
        <strong>{data.name}</strong> sai das turmas ativas e não consegue mais
        entrar no sistema. Os dados ficam no Arquivo e podem ser restaurados.
      </p>
    </ConfirmModal>
  )
}
