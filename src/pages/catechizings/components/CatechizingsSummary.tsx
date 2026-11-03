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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {summaryGroups.map((group) => {
        const isSelected = group.key === selectedGroup
        return (
          <button
            key={group.key}
            type="button"
            onClick={() => onSelect(group.key)}
            className={`flex flex-col items-start rounded-xl px-4 py-3 text-left shadow shadow-black duration-150 ${
              isSelected
                ? 'bg-bunker-300 text-bunker-950'
                : 'bg-bunker-900 text-white hover:bg-bunker-800'
            }`}
          >
            <span
              className={`text-xs uppercase ${isSelected ? 'text-bunker-800' : 'text-bunker-300'}`}
            >
              {group.label}
            </span>
            <span className="text-2xl font-semibold">{counts[group.key]}</span>
          </button>
        )
      })}
    </div>
  )
}
