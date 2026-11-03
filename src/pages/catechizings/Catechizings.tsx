import { ClassroomContext } from '@/contexts/ClassroomContext'
import { Button, Tooltip } from '@nextui-org/react'
import { UserPlus } from '@phosphor-icons/react'
import { useContext, useState } from 'react'
import { AddNewCatechizingModal } from './components/modals/AddNewCatechizingModal'
import { CatechizingsTable } from './components/CatechizingsTable'
import { useAuth } from '@/hooks/useAuth'
import { SearchInput } from '@/components/SearchInput'
import { matchesSearch } from '@/utils/search'
import { CatechizingsSummary } from './components/CatechizingsSummary'
import { summaryGroup, summaryGroups } from './summaryGroups'

export function Catechizings() {
  const { user } = useAuth()
  const { catechizings, classrooms } = useContext(ClassroomContext)
  const [search, setSearch] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<summaryGroup>('all')

  const [isUserAddingNewCatechizing, setIsUserAddingNewCatechizing] =
    useState<boolean>(false)

  function isInGroup(classroomId: string | undefined, group: summaryGroup) {
    const segments = summaryGroups.find((item) => item.key === group)?.segments
    if (!segments) {
      return true
    }
    const classroom = classrooms.find((item) => item.id === classroomId)
    return Boolean(classroom?.segment && segments.includes(classroom.segment))
  }

  const counts = Object.fromEntries(
    summaryGroups.map((group) => [
      group.key,
      catechizings.filter((catechizing) =>
        isInGroup(catechizing.classroomId, group.key),
      ).length,
    ]),
  ) as Record<summaryGroup, number>

  const filteredCatechizings = catechizings.filter(
    (catechizing) =>
      isInGroup(catechizing.classroomId, selectedGroup) &&
      matchesSearch(catechizing.name, search),
  )

  return (
    <div className="mx-4 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4 sm:mx-10">
      <nav className="flex flex-col items-center justify-between gap-8 sm:flex-row">
        {user?.role === 'COORDINATOR' && (
          <AddNewCatechizingModal
            isOpen={isUserAddingNewCatechizing}
            onClose={() => setIsUserAddingNewCatechizing(false)}
          />
        )}

        <h1 className="text-3xl">Catequizandos</h1>
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <SearchInput value={search} onChange={setSearch} />
          {user?.role === 'COORDINATOR' && (
            <Tooltip
              content="Adicionar novo catequizando"
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
          )}
        </div>
      </nav>
      <CatechizingsSummary
        counts={counts}
        selectedGroup={selectedGroup}
        onSelect={setSelectedGroup}
      />
      <CatechizingsTable
        catechizings={filteredCatechizings}
        isAdultClassroom={selectedGroup === 'adults'}
      />
    </div>
  )
}
