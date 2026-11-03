import { SearchInput } from '@/components/SearchInput'
import { matchesSearch } from '@/utils/search'
import { CatechizingsTable } from '@/pages/catechizings/components/CatechizingsTable'
import { classroom, isAdultSegment } from '@/Types'
import { useState } from 'react'
import { ToolBar } from './ToolBar'

interface ClassroomViewProps {
  classroom: classroom
}

// Cabeçalho, ações, busca e tabela de uma turma
export function ClassroomView({ classroom }: ClassroomViewProps) {
  const [search, setSearch] = useState<string>('')

  const catechizings = (classroom.catechizings ?? []).filter((catechizing) =>
    matchesSearch(catechizing.name, search),
  )

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl">{classroom.name}</h1>
          <p className="text-sm text-bunker-300">
            {classroom.segment} · início em {classroom.startedAt} ·{' '}
            {classroom.catechizings?.length ?? 0} catequizandos
          </p>
        </div>
        <ToolBar classroom={classroom} />
      </div>
      <SearchInput value={search} onChange={setSearch} />
      <CatechizingsTable
        catechizings={catechizings}
        hasPageClassroomInfo
        isAdultClassroom={isAdultSegment(classroom.segment)}
      />
    </section>
  )
}
