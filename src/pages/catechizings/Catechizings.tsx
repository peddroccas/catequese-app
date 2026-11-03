import { ClassroomContext } from '@/contexts/ClassroomContext'
import { Button } from '@nextui-org/react'
import { PageHeader } from '@/components/PageHeader'
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
    <div className="flex flex-grow flex-col gap-6">
      {user?.role === 'COORDINATOR' && (
        <AddNewCatechizingModal
          isOpen={isUserAddingNewCatechizing}
          onClose={() => setIsUserAddingNewCatechizing(false)}
        />
      )}
      <PageHeader
        title="Catequizandos"
        description="Todos os catequizandos da paróquia"
      >
        {user?.role === 'COORDINATOR' && (
          <Button
            color="primary"
            startContent={<UserPlus size={18} />}
            onPress={() => setIsUserAddingNewCatechizing(true)}
          >
            Novo catequizando
          </Button>
        )}
      </PageHeader>
      <CatechizingsSummary
        counts={counts}
        selectedGroup={selectedGroup}
        onSelect={setSelectedGroup}
      />
      <SearchInput value={search} onChange={setSearch} />
      <CatechizingsTable
        catechizings={filteredCatechizings}
        isAdultClassroom={selectedGroup === 'adults'}
      />
    </div>
  )
}
