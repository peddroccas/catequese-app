import { catechist } from '@/Types'
import { RowAction } from '@/components/IconButton'
import { Archive, Key, PencilSimple } from '@phosphor-icons/react'
import { useState } from 'react'
import { EditCatechistModal } from './modals/EditCatechistModal'
import { ArchiveCatechistModal } from './modals/ArchiveCatechistModal'
import { ResetPasswordModal } from './modals/ResetPasswordModal'

interface ToolBarProps {
  catechist: catechist
}
export default function ToolBar({ catechist }: ToolBarProps) {
  const [isUserEditingCatechist, setIsUserEditingCatechist] =
    useState<boolean>(false)
  const [isUserArchivingCatechist, setIsUserArchivingCatechist] =
    useState<boolean>(false)
  const [isUserResettingPassword, setIsUserResettingPassword] =
    useState<boolean>(false)
  return (
    <div className="flex items-center justify-center gap-0.5">
      <EditCatechistModal
        isOpen={isUserEditingCatechist}
        data={catechist}
        onClose={() => setIsUserEditingCatechist(false)}
      />
      <ArchiveCatechistModal
        isOpen={isUserArchivingCatechist}
        onClose={() => setIsUserArchivingCatechist(false)}
        data={catechist}
      />
      <ResetPasswordModal
        isOpen={isUserResettingPassword}
        onClose={() => setIsUserResettingPassword(false)}
        data={catechist}
      />
      <RowAction
        label="Editar"
        icon={<PencilSimple size={18} />}
        onPress={() => setIsUserEditingCatechist(true)}
      />
      <RowAction
        label="Resetar senha"
        icon={<Key size={18} />}
        onPress={() => setIsUserResettingPassword(true)}
      />
      <RowAction
        label="Arquivar"
        variant="danger"
        icon={<Archive size={18} />}
        onPress={() => setIsUserArchivingCatechist(true)}
      />
    </div>
  )
}
