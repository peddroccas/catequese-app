import { AddNewCatechizingModal } from '@/pages/catechizings/components/modals/AddNewCatechizingModal'
import {
  DownloadSimple,
  FilePdf,
  PencilSimple,
  Archive,
  PaperPlaneTilt,
  UserPlus,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { EditClassroomModal } from './modals/EditClassroomModal'
import { classroom } from '@/Types'
import { ArchiveClassroomModal } from './modals/ArchiveClassroomModal'
import { downloadCallList } from '@/utils/downloadCallList'
import { downloadClassroomPdf } from '@/utils/pdf'
import { useAuth } from '@/hooks/useAuth'
import { IconButton } from '@/components/IconButton'
import { InviteParentsModal } from './modals/InviteParentsModal'

interface ToolBarProps {
  classroom: classroom
}

export function ToolBar({ classroom }: ToolBarProps) {
  const { user } = useAuth()
  const isCoordinator = user?.role === 'COORDINATOR'
  const [isUserAddingNewCatechizing, setIsUserAddingNewCatechizing] =
    useState<boolean>(false)
  const [isUserArchivingClassroom, setIsUserArchivingClassroom] =
    useState<boolean>(false)
  const [isUserEditingClassroom, setIsUserEditingClassroom] =
    useState<boolean>(false)
  const [isUserInvitingParents, setIsUserInvitingParents] =
    useState<boolean>(false)

  return (
    <div className="flex flex-wrap gap-2">
      <InviteParentsModal
        classroom={classroom}
        isOpen={isUserInvitingParents}
        onClose={() => setIsUserInvitingParents(false)}
        onEditLink={
          isCoordinator
            ? () => {
                setIsUserInvitingParents(false)
                setIsUserEditingClassroom(true)
              }
            : undefined
        }
      />
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
          <ArchiveClassroomModal
            isOpen={isUserArchivingClassroom}
            onClose={() => setIsUserArchivingClassroom(false)}
            data={classroom}
          />
        </>
      )}
      {classroom.whatsappGroupLink && (
        <IconButton
          label="Abrir grupo do WhatsApp"
          icon={<WhatsappLogo size={20} />}
          onPress={() =>
            window.open(classroom.whatsappGroupLink!, '_blank', 'noopener')
          }
        />
      )}
      <IconButton
        label="Convidar responsáveis para o grupo"
        icon={<PaperPlaneTilt size={20} />}
        onPress={() => setIsUserInvitingParents(true)}
      />
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
            label="Arquivar turma"
            variant="danger"
            icon={<Archive size={20} />}
            onPress={() => setIsUserArchivingClassroom(true)}
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
