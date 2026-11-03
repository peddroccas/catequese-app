import { ConfirmModal } from '@/components/ConfirmModal'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { classroom } from '@/Types'
import { useContext } from 'react'

interface ArchiveClassroomModalProps {
  data: classroom
  isOpen: boolean
  onClose: () => void
}

export function ArchiveClassroomModal({
  data,
  isOpen,
  onClose,
}: ArchiveClassroomModalProps) {
  const { throwClassroomUpdate, throwCatechistUpdate, throwCatechizingUpdate } =
    useContext(ClassroomContext)

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Arquivar turma?"
      confirmLabel="Arquivar"
      onConfirm={async () => {
        await ClassroomRepository.archiveClassroom(data.id!)
        throwClassroomUpdate()
        throwCatechistUpdate()
        throwCatechizingUpdate()
      }}
    >
      <p>
        A turma <strong>{data.name ?? data.location}</strong> ({data.segment})
        vai para o Arquivo junto com os {data.catechizings?.length ?? 0}{' '}
        catequizandos.
      </p>
      <p>
        Os catequizandos também são arquivados e aparecem na aba Catequizandos
        do Arquivo. Nada é apagado: dá para consultar e restaurar a turma a
        qualquer momento.
      </p>
    </ConfirmModal>
  )
}
