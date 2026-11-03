import { classroom, segment, segments } from '@/Types'
import { compareNatural, joinNames } from '@/utils/names'
import { surfaceClassName } from './tableStyles'

interface ClassroomListProps {
  classrooms: classroom[]
  selectedClassroomId?: string
  onSelect: (classroom: classroom) => void
}

// Uma cor por segmento para achar o grupo de relance
const segmentColors: Record<segment, string> = {
  'Eucaristia 1': 'bg-amber-400',
  'Eucaristia 2': 'bg-orange-500',
  'Crisma 1': 'bg-red-700',
  'Crisma 2': 'bg-red-700',
  'Catequese Adultos': 'bg-sky-500',
}

function SegmentDot({ segment }: { segment?: segment }) {
  return (
    <span
      aria-hidden
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${segment ? segmentColors[segment] : 'bg-bunker-300'}`}
    />
  )
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

  const groups = segments
    .map((segment) => ({
      segment,
      classrooms: classrooms
        .filter((classroom) => classroom.segment === segment)
        .sort((a, b) => compareNatural(a.location, b.location)),
    }))
    .filter((group) => group.classrooms.length)

  return (
    <>
      {/* Celular: faixa horizontal que rola de lado */}
      <nav
        aria-label="Turmas"
        className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 md:hidden"
      >
        {groups
          .flatMap((group) => group.classrooms)
          .map((classroom) => {
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
                <span className="text-sm font-medium">
                  {classroom.location}
                </span>
                <span
                  className={`flex items-center gap-1.5 text-[11px] font-medium ${isSelected ? 'text-bunker-200' : 'text-bunker-600'}`}
                >
                  {/* <SegmentDot segment={classroom.segment} /> */}
                  {classroom.segment}
                </span>
              </button>
            )
          })}
      </nav>
      <nav
        aria-label="Turmas"
        className={`${surfaceClassName} hidden flex-col gap-3 p-3 md:flex`}
      >
        {groups.map((group) => (
          <section
            key={group.segment}
            className="flex flex-col gap-0.5 border-t border-bunker-100 pt-3 first:border-none first:pt-0"
          >
            <h2 className="mb-1 flex items-center justify-between gap-2 rounded-lg bg-bunker-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-bunker-800">
              <span className="flex items-center gap-2">
                {/* <SegmentDot segment={group.segment} /> */}
                {group.segment}
              </span>
              <span className="rounded-full bg-white px-1.5 text-[11px] font-semibold text-bunker-600">
                {group.classrooms.length}
              </span>
            </h2>
            {group.classrooms.map((classroom) => {
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
                    {joinNames(
                      classroom.catechists?.map(
                        (catechist) => catechist.nickname,
                      ) ?? [],
                    ) || 'Sem catequista'}
                  </span>
                </button>
              )
            })}
          </section>
        ))}
      </nav>
    </>
  )
}
