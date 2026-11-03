import { catechist } from '@/Types'
import { RowAction } from '@/components/IconButton'
import { Key, PencilSimple, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import { EditCatechistModal } from './modals/EditCatechistModal'
import { DeleteCatechistModal } from './modals/DeleteCatechistModal'
import { ResetPasswordModal } from './modals/ResetPasswordModal'

interface ToolBarProps {
  catechist: catechist
}
export default function ToolBar({ catechist }: ToolBarProps) {
  const [isUserEditingCatechist, setIsUserEditingCatechist] =
    useState<boolean>(false)
  const [isUserDeletingCatechist, setIsUserDeletingCatechist] =
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
      <DeleteCatechistModal
        isOpen={isUserDeletingCatechist}
        onClose={() => setIsUserDeletingCatechist(false)}
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
        label="Deletar"
        variant="danger"
        icon={<Trash size={18} />}
        onPress={() => setIsUserDeletingCatechist(true)}
      />
    </div>
  )
}
