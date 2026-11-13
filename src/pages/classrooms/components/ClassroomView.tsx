import { SearchInput } from '@/components/SearchInput'
import { PageHeader } from '@/components/PageHeader'
import { matchesSearch } from '@/utils/search'
import { CatechizingsTable } from '@/pages/catechizings/components/CatechizingsTable'
import { classroom, isAdultSegment } from '@/Types'
import { SegmentChip } from '@/components/SegmentChip'
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
    <section className="flex flex-col gap-5">
      <PageHeader
        title={classroom.name ?? classroom.location}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <SegmentChip segment={classroom.segment} />
            <span>Início em {classroom.startedAt}</span>
            <span aria-hidden>·</span>
            <span>{classroom.catechizings?.length ?? 0} catequizandos</span>
          </span>
        }
      >
        <ToolBar classroom={classroom} />
      </PageHeader>
      <SearchInput value={search} onChange={setSearch} />
      <CatechizingsTable
        catechizings={catechizings}
        hasPageClassroomInfo
        isAdultClassroom={isAdultSegment(classroom.segment)}
      />
    </section>
  )
}
