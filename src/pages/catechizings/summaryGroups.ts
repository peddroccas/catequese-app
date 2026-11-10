import { adultSegments, catechizingGroup, segment } from '@/Types'

export type summaryGroup = catechizingGroup

export const summaryGroups: {
  key: summaryGroup
  label: string
  segments?: segment[]
}[] = [
  { key: 'all', label: 'Total' },
  {
    key: 'eucharist',
    label: 'Eucaristia',
    segments: ['Pré-Eucaristia', 'Eucaristia 1', 'Eucaristia 2'],
  },
  { key: 'confirmation', label: 'Crisma', segments: ['Crisma 1', 'Crisma 2'] },
  { key: 'adults', label: 'Adultos', segments: adultSegments },
]
