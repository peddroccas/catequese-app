import { ClassroomContext } from '@/contexts/ClassroomContext'
import { Button, Input, Tooltip } from '@nextui-org/react'
import { MagnifyingGlass, UserPlus } from '@phosphor-icons/react'
import { useContext, useEffect, useState } from 'react'
import { AddNewCatechizingModal } from './components/modals/AddNewCatechizingModal'
import { CatechizingsTable } from './components/CatechizingsTable'
import { catechizing } from '@/Types'

export function Catechizings() {
  const { catechizings } = useContext(ClassroomContext)
  const [filteredCatechizing, setFilteredCatechizing] =
    useState<catechizing[]>(catechizings)
  const [search, setSearch] = useState<string>('')

  const [isUserAddingNewCatechizing, setIsUserAddingNewCatechizing] =
    useState<boolean>(false)

  useEffect(() => {
    setFilteredCatechizing(
      catechizings.filter((catechizing) =>
        catechizing.name
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
      ),
    )
  }, [catechizings, search])

  return (
    <div className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
      <nav className="flex items-center justify-between">
        <AddNewCatechizingModal
          isOpen={isUserAddingNewCatechizing}
          onClose={() => setIsUserAddingNewCatechizing(false)}
        />
        <h1 className="text-2xl">Catequizandos</h1>
        <div className="flex items-center gap-8">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={
              <MagnifyingGlass className="text-bunker-950" size={20} />
            }
          />
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
        </div>
      </nav>
      {catechizings && <CatechizingsTable catechizings={filteredCatechizing} />}
    </div>
  )
}
