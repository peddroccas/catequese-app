import { classroom, segments } from '@/Types'
import { surfaceClassName } from './tableStyles'

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
    return <p className="text-sm text-bunker-500">Nenhuma turma cadastrada.</p>
  }

  const orderedClassrooms = segments.flatMap((segment) =>
    classrooms.filter((classroom) => classroom.segment === segment),
  )

  return (
    <>
      {/* Celular: faixa horizontal que rola de lado */}
      <nav
        aria-label="Turmas"
        className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 md:hidden"
      >
        {orderedClassrooms.map((classroom) => {
          const isSelected = classroom.id === selectedClassroomId
          return (
            <button
              key={classroom.id}
              type="button"
              aria-current={isSelected}
              onClick={() => onSelect(classroom)}
              className={`flex shrink-0 flex-col rounded-xl border px-3 py-2 text-left shadow-sm transition-colors duration-150 ${
                isSelected
                  ? 'border-bunker-700 bg-bunker-800 text-white'
                  : 'border-bunker-200/70 bg-white text-bunker-800'
              }`}
            >
              <span className="text-sm font-medium">{classroom.location}</span>
              <span
                className={`text-[11px] ${isSelected ? 'text-bunker-300' : 'text-bunker-500'}`}
              >
                {classroom.segment}
              </span>
            </button>
          )
        })}
      </nav>
      <nav
        aria-label="Turmas"
        className={`${surfaceClassName} hidden flex-col gap-4 p-3 md:flex`}
      >
        {segments.map((segment) => {
          const segmentClassrooms = classrooms.filter(
            (classroom) => classroom.segment === segment,
          )
          if (!segmentClassrooms.length) {
            return null
          }
          return (
            <section key={segment} className="flex flex-col gap-0.5">
              <h2 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-bunker-400">
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
                    className={`relative flex flex-col rounded-lg px-3 py-2 text-left transition-colors duration-150 ${
                      isSelected
                        ? 'bg-bunker-100 text-bunker-900 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-bunker-700'
                        : 'text-bunker-700 hover:bg-bunker-50'
                    }`}
                  >
                    <span
                      className={`text-sm ${isSelected ? 'font-semibold' : 'font-medium'}`}
                    >
                      {classroom.location}
                    </span>
                    <span className="truncate text-xs text-bunker-500">
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
    </>
  )
}
