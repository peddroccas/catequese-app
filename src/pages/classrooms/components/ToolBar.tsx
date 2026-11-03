import { AddNewCatechizingModal } from '@/pages/catechizings/components/modals/AddNewCatechizingModal'
import { Button, Tooltip } from '@nextui-org/react'
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

interface ToolBarProps {
  classroom: classroom
}

const buttonClassName =
  'bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500'

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
      <Tooltip
        content="Baixar lista de chamada"
        className="text-bunker-950"
        closeDelay={0}
      >
        <Button
          isIconOnly
          aria-label="Baixar lista de chamada"
          onPress={() => downloadCallList({ classroom })}
          className={buttonClassName}
        >
          <DownloadSimple size={28} className="text-white" />
        </Button>
      </Tooltip>
      <Tooltip
        content="Gerar PDF com os dados dos catequizandos"
        className="text-bunker-950"
        closeDelay={0}
      >
        <Button
          isIconOnly
          aria-label="Gerar PDF da turma"
          onPress={() => downloadClassroomPdf(classroom)}
          className={buttonClassName}
        >
          <FilePdf size={28} className="text-white" />
        </Button>
      </Tooltip>
      {isCoordinator && (
        <>
          <Tooltip
            content="Adicionar novo catequizando à turma"
            className="text-bunker-950"
            closeDelay={0}
          >
            <Button
              isIconOnly
              aria-label="Adicionar catequizando"
              onPress={() => setIsUserAddingNewCatechizing(true)}
              className={buttonClassName}
            >
              <UserPlus size={28} className="text-white" />
            </Button>
          </Tooltip>
          <Tooltip
            content="Editar turma"
            className="text-bunker-950"
            closeDelay={0}
          >
            <Button
              isIconOnly
              aria-label="Editar turma"
              onPress={() => setIsUserEditingClassroom(true)}
              className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-orange-400"
            >
              <PencilSimple size={28} className="text-white" />
            </Button>
          </Tooltip>
          <Tooltip
            content="Deletar turma"
            className="text-bunker-950"
            closeDelay={0}
          >
            <Button
              isIconOnly
              aria-label="Deletar turma"
              className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-red-600"
              onPress={() => setIsUserDeletingClassroom(true)}
            >
              <Trash size={28} className="text-white" />
            </Button>
          </Tooltip>
        </>
      )}
    </div>
  )
}
