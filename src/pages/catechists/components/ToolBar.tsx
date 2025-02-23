import { catechist } from '@/Types'
import { Tooltip } from '@heroui/react'
import { ArrowsLeftRight, PencilSimple, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import { EditCatechistModal } from './modals/EditCatechistModal'
import { DeleteCatechistModal } from './modals/DeleteCatechistModal'
import { TransferModal } from '@/components/TransferModal'

interface ToolBarProps {
  catechist: catechist
}
export default function ToolBar({ catechist }: ToolBarProps) {
  const [isUserEditingCatechist, setIsUserEditingCatechist] =
    useState<boolean>(false)
  const [isUserDeletingCatechist, setIsUserDeletingCatechist] =
    useState<boolean>(false)
  const [isUserTransferingCatechist, setIsUserTransferingCatechist] =
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
      <TransferModal
        data={catechist}
        isOpen={isUserTransferingCatechist}
        onClose={() => setIsUserTransferingCatechist(false)}
        type="catechist"
      />
      <Tooltip
        content="Transferir de sala"
        placement="left"
        className="text-bunker-950"
        closeDelay={0}
      >
        <ArrowsLeftRight
          size={20}
          className="cursor-pointer duration-300 hover:opacity-60"
          onClick={() => setIsUserTransferingCatechist(true)}
        />
      </Tooltip>
      <PencilSimple
        size={20}
        className="cursor-pointer duration-300 hover:opacity-60"
        onClick={() => setIsUserEditingCatechist(true)}
      />

      <Trash
        size={20}
        className="cursor-pointer duration-300 hover:text-red-500"
        onClick={() => setIsUserDeletingCatechist(true)}
      />
    </div>
  )
}
