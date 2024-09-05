import { AddNewCatechizingModal } from '@/pages/catechizings/components/AddNewCatechizingModal'
import { Button, Tooltip } from '@nextui-org/react'
import { PencilSimple, Plus, Trash, UserPlus } from '@phosphor-icons/react'
import { useState } from 'react'
import { AddNewClassroomModal } from './AddNewClassroomModal'

interface ToolBarProps {
  isClassroomSelected: boolean
}

export function ToolBar({ isClassroomSelected }: ToolBarProps) {
  const [isUserAddingNewCatechizing, setIsUserAddingNewCatechizing] =
    useState<boolean>(false)
  const [isUserAddingNewClassroom, setIsUserAddingNewClassroom] =
    useState<boolean>(false)
  const [_isUserDeletingClassroom, _setIsUserDeletingClassroom] =
    useState<boolean>(false)
  const [_isUserEditingClassroom, _setIsUserEditingClassroom] =
    useState<boolean>(false)

  return (
    <div className="flex gap-2">
      <AddNewClassroomModal
        isOpen={isUserAddingNewClassroom}
        onClose={() => setIsUserAddingNewClassroom(false)}
      />
      <AddNewCatechizingModal
        isOpen={isUserAddingNewCatechizing}
        onClose={() => setIsUserAddingNewCatechizing(false)}
      />
      <Tooltip
        content="Adicionar novo catequizando a sala"
        className="text-bunker-950"
        closeDelay={0}
      >
        <Button
          isDisabled={!isClassroomSelected}
          isIconOnly
          onPress={() => setIsUserAddingNewCatechizing(true)}
          className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
        >
          <UserPlus size={28} className="text-white" />
        </Button>
      </Tooltip>
      <Tooltip
        content="Adicionar nova turma"
        className="text-bunker-950"
        closeDelay={0}
      >
        <Button
          isIconOnly
          onPress={() => setIsUserAddingNewClassroom(true)}
          className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
        >
          <Plus size={28} className="text-white" />
        </Button>
      </Tooltip>
      <Tooltip content="Editar sala" className="text-bunker-950" closeDelay={0}>
        <Button
          isIconOnly
          isDisabled={!isClassroomSelected}
          className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-orange-400"
        >
          <PencilSimple size={28} className="text-white" />
        </Button>
      </Tooltip>
      <Tooltip
        content="Deletar sala"
        className="text-bunker-950"
        closeDelay={0}
      >
        <Button
          isIconOnly
          isDisabled={!isClassroomSelected}
          className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-red-600"
        >
          <Trash size={28} className="text-white" />
        </Button>
      </Tooltip>
    </div>
  )
}
