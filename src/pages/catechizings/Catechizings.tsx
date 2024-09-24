import { ClassroomContext } from '@/contexts/ClassroomContext'
import { Button, Tooltip } from '@nextui-org/react'
import { UserPlus } from '@phosphor-icons/react'
import { useContext, useEffect, useState } from 'react'
import { AddNewCatechizingModal } from './components/AddNewCatechizingModal'
import { CatechizingsTable } from './components/CatechizingsTable'
import { useAuth } from '@/hooks/useAuth'

export function Catechizings() {
  const { catechizings } = useContext(ClassroomContext)
  const auth = useAuth()

  useEffect(() => {
    auth()
  })

  const [isUserAddingNewCatechizing, setIsUserAddingNewCatechizing] =
    useState<boolean>(false)

  return (
    <div className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
      <nav className="flex items-center justify-between">
        <AddNewCatechizingModal
          isOpen={isUserAddingNewCatechizing}
          onClose={() => setIsUserAddingNewCatechizing(false)}
        />
        <h1 className="text-2xl">Catequizandos</h1>
        <Tooltip
          content="Adicionar novo catequista"
          className="text-bunker-950"
          closeDelay={0}
        >
          <Button
            isIconOnly
            onPress={() => setIsUserAddingNewCatechizing(true)}
            className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
          >
            <UserPlus size={28} className="text-white" />
          </Button>
        </Tooltip>
      </nav>
      {catechizings && <CatechizingsTable catechizings={catechizings} />}
    </div>
  )
}
