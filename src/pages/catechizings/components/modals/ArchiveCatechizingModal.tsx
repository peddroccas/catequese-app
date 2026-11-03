import { ConfirmModal } from '@/components/ConfirmModal'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { catechizing } from '@/Types'
import { useContext } from 'react'

interface ArchiveCatechizingModalProps {
  data: catechizing
  isOpen: boolean
  onClose: () => void
}

export function ArchiveCatechizingModal({
  data,
  isOpen,
  onClose,
}: ArchiveCatechizingModalProps) {
  const { throwClassroomUpdate, throwCatechizingUpdate } =
    useContext(ClassroomContext)

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Arquivar catequizando?"
      confirmLabel="Arquivar"
      onConfirm={async () => {
        await CatechizingRepository.archiveCatechizing(data.id!)
        throwCatechizingUpdate()
        throwClassroomUpdate()
      }}
    >
      <p>
        <strong>{data.name}</strong> sai da turma e das listas, mas os dados
        ficam guardados no Arquivo, de onde dá para consultar ou restaurar.
      </p>
    </ConfirmModal>
  )
}
