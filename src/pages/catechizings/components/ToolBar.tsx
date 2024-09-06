import { catechizing } from '@/Types'
import { Button, Tooltip } from '@nextui-org/react'
import { ArrowsLeftRight, PencilSimple, Trash } from '@phosphor-icons/react'
import { useState } from 'react'

interface ToolBarProps {
  catechizing: catechizing
}
export default function ToolBar({ catechizing }: ToolBarProps) {
  const [_isUserEditingCatechizing, _setIsUserEditingCatechizing] =
    useState<boolean>(false)
  const [_isUserDeletingCatechizing, _setIsUserDeletingCatechizing] =
    useState<boolean>(false)
  const [_isUserTransferingCatechizing, _setIsUserDTransferingatechizing] =
    useState<boolean>(false)
  return (
    <div className="flex items-center justify-end gap-2">
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
      />

      <Trash
        size={20}
        className="cursor-pointer duration-300 hover:text-red-500"
      />
    </div>
  )
}
