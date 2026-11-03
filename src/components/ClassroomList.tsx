import { classroom, segments } from '@/Types'

interface ClassroomListProps {
  classrooms: classroom[]
  selectedClassroomId?: string
  onSelect: (classroom: classroom) => void
}

// Lista compacta das turmas agrupadas por segmento, para escolher com um clique
export function ClassroomList({
  classrooms,
  selectedClassroomId,
  onSelect,
}: ClassroomListProps) {
  if (!classrooms.length) {
    return <p className="text-sm text-bunker-300">Nenhuma turma cadastrada.</p>
  }

  return (
    <nav
      aria-label="Turmas"
      className="flex flex-col gap-3 rounded-xl bg-bunker-900 p-3 shadow shadow-black"
    >
      {segments.map((segment) => {
        const segmentClassrooms = classrooms.filter(
          (classroom) => classroom.segment === segment,
        )
        if (!segmentClassrooms.length) {
          return null
        }
        return (
          <section key={segment} className="flex flex-col gap-1">
            <h2 className="px-2 text-xs font-semibold uppercase text-bunker-400">
              {segment}
            </h2>
            {segmentClassrooms.map((classroom) => {
              const isSelected = classroom.id === selectedClassroomId
              return (
                <button
                  key={classroom.id}
                  type="button"
                  aria-current={isSelected}
                  onClick={() => onSelect(classroom)}
                  className={`flex flex-col rounded-lg px-2 py-1.5 text-left duration-150 ${
                    isSelected
                      ? 'bg-bunker-300 text-bunker-950'
                      : 'text-white hover:bg-bunker-800'
                  }`}
                >
                  <span className="text-sm font-medium">
                    {classroom.location}
                  </span>
                  <span
                    className={`truncate text-xs ${isSelected ? 'text-bunker-800' : 'text-bunker-300'}`}
                  >
                    {classroom.catechists
                      ?.map((catechist) => catechist.nickname)
                      .join(' e ') || 'Sem catequista'}
                  </span>
                </button>
              )
            })}
          </section>
        )
      })}
    </nav>
  )
}
