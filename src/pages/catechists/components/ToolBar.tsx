import { catechist } from '@/Types'
import { Tooltip } from '@nextui-org/react'
import { ArrowsLeftRight, PencilSimple, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import { EditCatechistModal } from './EditCatechistModal'

interface ToolBarProps {
  catechist: catechist
}
export default function ToolBar({ catechist }: ToolBarProps) {
  const [isUserEditingCatechist, setIsUserEditingCatechist] =
    useState<boolean>(false)
  const [_isUserDeletingCatechist, _setIsUserDeletingCatechist] =
    useState<boolean>(false)
  const [_isUserTransferingCatechist, _setIsUserDTransferingatechizing] =
    useState<boolean>(false)
  return (
    <div className="flex items-center justify-center gap-2">
      <EditCatechistModal
        isOpen={isUserEditingCatechist}
        data={catechist}
        onClose={() => setIsUserEditingCatechist(false)}
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
      />
    </div>
  )
}
