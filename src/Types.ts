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
}

export const segments = [
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
}

export interface attendance {
  catechistId: string
  isPresent: boolean
}

export interface formation {
  id?: string
  theme: string
  date: string
  attendances: attendance[]
}
