export type role = 'COORDINATOR' | 'MEMBER'

export interface catechist {
  id?: string
  name: string
  nickname: string
  // Datas sem hora vêm da API como 'AAAA-MM-DD'
  birthday: string | undefined
  phone: string
  address: string
  classroomIds: string[]
  role: role | undefined

  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  hasReceivedConfirmation: boolean
  hasReceivedMarriage: boolean

  email?: string
  // Data em que foi para o arquivo; null enquanto está ativo
  archivedAt?: string | null
  // URL pública da foto de perfil; null quando não tem foto
  avatarUrl?: string | null
}

export interface parent {
  id?: string
  name: string
  phone: string
  kinship: string
}

export const maritalStatuses = [
  'Solteiro(a)',
  'Casado(a)',
  'União estável',
  'Separado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
] as const

export type maritalStatus = (typeof maritalStatuses)[number]

export interface catechizing {
  id?: string
  name: string
  birthday: string | undefined
  address: string
  personWithSpecialNeeds: boolean
  specialNeedsDescription: string | null
  releasedToGoAwayAlone: boolean
  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  hasReceivedMarriage: boolean
  // Só preenchidos em turmas de adultos
  maritalStatus: maritalStatus | null
  livesWithPartner: boolean | null
  classroomId?: string
  parents: parent[]
  archivedAt?: string | null
}

export const segments = [
  'Pré-Eucaristia',
  'Eucaristia 1',
  'Eucaristia 2',
  'Crisma 1',
  'Crisma 2',
  'Catequese Adultos',
] as const

export type segment = (typeof segments)[number]

export const adultSegments: segment[] = ['Catequese Adultos']

export function isAdultSegment(segment?: segment) {
  return Boolean(segment && adultSegments.includes(segment))
}

export interface classroomCatechist {
  id: string
  name: string
  nickname: string
}

export interface classroom {
  id?: string
  name?: string
  location: string
  segment: segment | undefined
  startedAt: number | undefined
  catechists?: classroomCatechist[]
  catechizings?: catechizing[]
  // Link de convite do grupo de WhatsApp (chat.whatsapp.com/...)
  whatsappGroupLink?: string | null
  archivedAt?: string | null
}

export interface attendance {
  catechistId: string
  isPresent: boolean
}

export interface formation {
  id?: string
  theme: string
  // Quem conduziu a formação
  instructor?: string | null
  date: string
  attendances: attendance[]
}

// Itinerário de temas dos encontros; cada segmento segue um
export const itineraries = [
  'Pré-Eucaristia',
  'Eucaristia',
  'Crisma',
  'Adultos',
] as const

export type itinerary = (typeof itineraries)[number]

export const segmentItinerary: Record<segment, itinerary> = {
  'Pré-Eucaristia': 'Pré-Eucaristia',
  'Eucaristia 1': 'Eucaristia',
  'Eucaristia 2': 'Eucaristia',
  'Crisma 1': 'Crisma',
  'Crisma 2': 'Crisma',
  'Catequese Adultos': 'Adultos',
}

export interface meetingTheme {
  id: string
  itinerary: itinerary
  // Tempo/fase do itinerário
  phase: string
  name: string
  position: number
  // Tema excluído: só aparece no histórico das chamadas
  archivedAt: string | null
}

export interface meetingAttendance {
  catechizingId: string
  // Vem da API; o catequizando pode ter saído da turma
  catechizingName?: string | null
  isPresent: boolean
}

// Encontro de uma turma com a chamada dos catequizandos
export interface meeting {
  id?: string
  classroomId: string
  date: string
  themes: meetingTheme[]
  attendances: meetingAttendance[]
}
