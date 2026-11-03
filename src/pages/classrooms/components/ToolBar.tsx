import { AddNewCatechizingModal } from '@/pages/catechizings/components/modals/AddNewCatechizingModal'
import {
  DownloadSimple,
  FilePdf,
  PencilSimple,
  Trash,
  UserPlus,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { EditClassroomModal } from './modals/EditClassroomModal'
import { classroom } from '@/Types'
import { DeleteClassroomModal } from './modals/DeleteClassroomModal'
import { downloadCallList } from '@/utils/downloadCallList'
import { downloadClassroomPdf } from '@/utils/pdf'
import { useAuth } from '@/hooks/useAuth'
import { IconButton } from '@/components/IconButton'

interface ToolBarProps {
  classroom: classroom
}

export function ToolBar({ classroom }: ToolBarProps) {
  const { user } = useAuth()
  const isCoordinator = user?.role === 'COORDINATOR'
  const [isUserAddingNewCatechizing, setIsUserAddingNewCatechizing] =
    useState<boolean>(false)
  const [isUserDeletingClassroom, setIsUserDeletingClassroom] =
    useState<boolean>(false)
  const [isUserEditingClassroom, setIsUserEditingClassroom] =
    useState<boolean>(false)

  return (
    <div className="flex gap-2">
      {isCoordinator && (
        <>
          <AddNewCatechizingModal
            isOpen={isUserAddingNewCatechizing}
            onClose={() => setIsUserAddingNewCatechizing(false)}
            classroomId={classroom.id}
          />
          <EditClassroomModal
            isOpen={isUserEditingClassroom}
            onClose={() => setIsUserEditingClassroom(false)}
            data={classroom}
          />
          <DeleteClassroomModal
            isOpen={isUserDeletingClassroom}
            onClose={() => setIsUserDeletingClassroom(false)}
            data={classroom}
          />
        </>
      )}
      <IconButton
        label="Baixar lista de chamada"
        icon={<DownloadSimple size={20} />}
        onPress={() => downloadCallList({ classroom })}
      />
      <IconButton
        label="Gerar PDF com os dados dos catequizandos"
        icon={<FilePdf size={20} />}
        onPress={() => downloadClassroomPdf(classroom)}
      />
      {isCoordinator && (
        <>
          <IconButton
            label="Editar turma"
            icon={<PencilSimple size={20} />}
            onPress={() => setIsUserEditingClassroom(true)}
          />
          <IconButton
            label="Deletar turma"
            variant="danger"
            icon={<Trash size={20} />}
            onPress={() => setIsUserDeletingClassroom(true)}
          />
          <IconButton
            label="Adicionar catequizando à turma"
            icon={<UserPlus size={20} />}
            onPress={() => setIsUserAddingNewCatechizing(true)}
          />
        </>
      )}
    </div>
  )
}
