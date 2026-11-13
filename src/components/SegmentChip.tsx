import { Chip } from '@nextui-org/react'
import { segmentTone } from '@/utils/segmentTone'
import type { segmentTone as tone } from '@/utils/segmentTone'

interface SegmentChipProps {
  // Etapa da turma ("Crisma 1") ou já o título da etapa da inscrição
  segment?: string | null
  label?: string
  // Cor pronta (inscrições usam a chave da etapa, não o nome da turma)
  tone?: tone
}

// Etiqueta da etapa com a cor litúrgica dela
export function SegmentChip({ segment, label, tone }: SegmentChipProps) {
  const colors = tone ?? segmentTone(segment)
  const text = label ?? segment

  if (!text) return null

  return (
    <Chip
      size="sm"
      variant="flat"
      startContent={
        <span
          aria-hidden
          className={`ml-1 h-2 w-2 shrink-0 rounded-full ${colors.dot}`}
        />
      }
      classNames={{
        base: colors.chip,
        content: `font-medium ${colors.text}`,
      }}
    >
      {text}
    </Chip>
  )
}
