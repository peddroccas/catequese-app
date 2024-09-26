import { catechizing } from '@/Types'
import { Tooltip } from '@nextui-org/react'
import {
  ArrowsLeftRight,
  Info,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { EditCatechizingModal } from './EditCatechizingModal'
import { TransferModal } from '@/components/TransferModal'
import { DeleteCatechizingModal } from './DeleteCatechizingModal'
import { CatechizingInfoModal } from './CatechizingInfoModal'

interface ToolBarProps {
  catechizing: catechizing
}
export default function ToolBar({ catechizing }: ToolBarProps) {
  const [isUserEditingCatechizing, setIsUserEditingCatechizing] =
    useState<boolean>(false)
  const [isUserDeletingCatechizing, setIsUserDeletingCatechizing] =
    useState<boolean>(false)
  const [isUserTransferingCatechizing, setIsUserTransferingatechizing] =
    useState<boolean>(false)
  const [isUserSeeingCatechizingInfo, setIsUserSeeingCatechizingInfo] =
    useState<boolean>(false)
  return (
    <div className="flex items-center justify-center gap-2">
      <CatechizingInfoModal
        isOpen={isUserSeeingCatechizingInfo}
        onClose={() => setIsUserSeeingCatechizingInfo(false)}
        data={catechizing}
      />
      <DeleteCatechizingModal
        data={catechizing}
        isOpen={isUserDeletingCatechizing}
        onClose={() => setIsUserDeletingCatechizing(false)}
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
        type="catechizing"
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
          onClick={() => setIsUserTransferingatechizing(true)}
        />
      </Tooltip>
      <PencilSimple
        size={20}
        className="cursor-pointer duration-300 hover:opacity-60"
        onClick={() => setIsUserEditingCatechizing(true)}
      />

      <Trash
        size={20}
        className="cursor-pointer duration-300 hover:text-red-500"
        onClick={() => setIsUserDeletingCatechizing(true)}
      />
      <Info
        size={20}
        className="cursor-pointer duration-300 hover:opacity-60"
        onClick={() => setIsUserSeeingCatechizingInfo(true)}
      />
    </div>
  )
}
