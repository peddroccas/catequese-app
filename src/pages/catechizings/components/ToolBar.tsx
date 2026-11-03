import { catechizing } from '@/Types'
import {
  ArrowsLeftRight,
  Info,
  PencilSimple,
  Archive,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { EditCatechizingModal } from './modals/EditCatechizingModal'
import { TransferModal } from '@/components/TransferModal'
import { ArchiveCatechizingModal } from './modals/ArchiveCatechizingModal'
import { CatechizingInfoModal } from './modals/CatechizingInfoModal'
import { useAuth } from '@/hooks/useAuth'
import { RowAction } from '@/components/IconButton'

interface ToolBarProps {
  catechizing: catechizing
  // No arquivo só dá para ver os dados
  isReadOnly?: boolean
}
export default function ToolBar({ catechizing, isReadOnly }: ToolBarProps) {
  const { user } = useAuth()
  const [isUserEditingCatechizing, setIsUserEditingCatechizing] =
    useState<boolean>(false)
  const [isUserArchivingCatechizing, setIsUserArchivingCatechizing] =
    useState<boolean>(false)
  const [isUserTransferingCatechizing, setIsUserTransferingatechizing] =
    useState<boolean>(false)
  const [isUserSeeingCatechizingInfo, setIsUserSeeingCatechizingInfo] =
    useState<boolean>(false)
  return (
    <div className="flex items-center justify-center gap-0.5">
      <CatechizingInfoModal
        isOpen={isUserSeeingCatechizingInfo}
        onClose={() => setIsUserSeeingCatechizingInfo(false)}
        data={catechizing}
      />
      <ArchiveCatechizingModal
        data={catechizing}
        isOpen={isUserArchivingCatechizing}
        onClose={() => setIsUserArchivingCatechizing(false)}
      />
      <EditCatechizingModal
        isOpen={isUserEditingCatechizing}
        data={catechizing}
        onClose={() => setIsUserEditingCatechizing(false)}
      />
      <TransferModal
        data={catechizing}
        isOpen={isUserTransferingCatechizing}
        onClose={() => setIsUserTransferingatechizing(false)}
      />
      <RowAction
        label="Ver dados"
        icon={<Info size={18} />}
        onPress={() => setIsUserSeeingCatechizingInfo(true)}
      />
      {user?.role === 'COORDINATOR' && !isReadOnly && (
        <>
          <RowAction
            label="Editar"
            icon={<PencilSimple size={18} />}
            onPress={() => setIsUserEditingCatechizing(true)}
          />
          <RowAction
            label="Transferir de turma"
            icon={<ArrowsLeftRight size={18} />}
            onPress={() => setIsUserTransferingatechizing(true)}
          />
          <RowAction
            label="Arquivar"
            variant="danger"
            icon={<Archive size={18} />}
            onPress={() => setIsUserArchivingCatechizing(true)}
          />
        </>
      )}
    </div>
  )
}
