import { summaryGroup, summaryGroups } from '../summaryGroups'

interface CatechizingsSummaryProps {
  counts: Record<summaryGroup, number>
  selectedGroup: summaryGroup
  onSelect: (group: summaryGroup) => void
}

// Totais de catequizandos por grupo; clicar filtra a tabela
export function CatechizingsSummary({
  counts,
  selectedGroup,
  onSelect,
}: CatechizingsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {summaryGroups.map((group) => {
        const isSelected = group.key === selectedGroup
        return (
          <button
            key={group.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(group.key)}
            className={`flex flex-col items-start gap-1 rounded-2xl border px-5 py-4 text-left shadow-sm transition-all duration-150 ${
              isSelected
                ? 'border-bunker-700 bg-bunker-800 text-white shadow-md'
                : 'border-bunker-200/70 bg-white text-bunker-900 hover:-translate-y-0.5 hover:border-bunker-300 hover:shadow-md'
            }`}
          >
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${isSelected ? 'text-bunker-300' : 'text-bunker-500'}`}
            >
              {group.label}
            </span>
            <span className="text-3xl font-semibold tabular-nums">
              {counts[group.key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
