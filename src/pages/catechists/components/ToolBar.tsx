import { catechist } from '@/Types'
import { Tooltip } from '@nextui-org/react'
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
    <div className="flex items-center justify-center gap-2">
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
      <Tooltip content="Editar" className="text-bunker-950" closeDelay={0}>
        <PencilSimple
          size={20}
          className="cursor-pointer duration-300 hover:opacity-60"
          onClick={() => setIsUserEditingCatechist(true)}
        />
      </Tooltip>
      <Tooltip
        content="Resetar senha"
        className="text-bunker-950"
        closeDelay={0}
      >
        <Key
          size={20}
          className="cursor-pointer duration-300 hover:text-yellow-400"
          onClick={() => setIsUserResettingPassword(true)}
        />
      </Tooltip>
      <Tooltip content="Deletar" className="text-bunker-950" closeDelay={0}>
        <Trash
          size={20}
          className="cursor-pointer duration-300 hover:text-red-500"
          onClick={() => setIsUserDeletingCatechist(true)}
        />
      </Tooltip>
    </div>
  )
}
