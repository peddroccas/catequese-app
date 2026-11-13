import { registrationSegment, segment } from '@/Types'

// Cor litúrgica de cada etapa (Figma › Branding › 09): verde na
// Pré-Eucaristia, dourado na Eucaristia, vermelho na Crisma e roxo nos adultos.
// As classes ficam escritas por inteiro para o Tailwind encontrá-las
export interface segmentTone {
  // Fundo da etiqueta
  chip: string
  // Texto da etiqueta
  text: string
  // Ponto e faixas
  dot: string
}

const tones = {
  pre: { chip: 'bg-verde-50', text: 'text-verde-700', dot: 'bg-verde-500' },
  eucaristia: { chip: 'bg-ouro-50', text: 'text-ouro-700', dot: 'bg-ouro-500' },
  crisma: {
    chip: 'bg-vermelho-50',
    text: 'text-vermelho-700',
    dot: 'bg-vermelho-500',
  },
  adultos: { chip: 'bg-roxo-50', text: 'text-roxo-700', dot: 'bg-roxo-500' },
  neutro: {
    chip: 'bg-bunker-100',
    text: 'text-bunker-700',
    dot: 'bg-bunker-500',
  },
} satisfies Record<string, segmentTone>

export function segmentTone(value?: segment | string | null): segmentTone {
  if (!value) return tones.neutro
  if (value.startsWith('Pré')) return tones.pre
  if (value.startsWith('Eucaristia')) return tones.eucaristia
  if (value.startsWith('Crisma')) return tones.crisma
  if (value.includes('Adultos')) return tones.adultos
  return tones.neutro
}

const registrationTones: Record<registrationSegment, segmentTone> = {
  PRE_EUCARISTIA: tones.pre,
  EUCARISTIA: tones.eucaristia,
  CRISMA: tones.crisma,
  ADULTOS: tones.adultos,
}

export function registrationSegmentTone(key: registrationSegment) {
  return registrationTones[key] ?? tones.neutro
}
