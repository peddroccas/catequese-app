import { DateValue } from '@nextui-org/react'

export interface catechist {
  id: number
  name: string
  birthday: DateValue | null
  phone: string
  address: string
  personWithSpecialNeeds?: string
  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  hasReceivedMarriage: boolean

  email: string
}

export interface payment {
  id: string
  toBePaid: number
  installments: {
    id: string
    payedAt: DateValue | null
    value: number
    payment_id: string
  }[]
}

export interface parent {
  name: string
  phone: string
  kinship: string
}

export interface catechizing {
  id?: number
  name: string
  birthday: DateValue | null
  address: string
  personWithSpecialNeeds: boolean
  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  hasReceivedMarriage: boolean
  classroomId?: string
  payments?: payment[]
  parents?: parent
}

export type segment =
  | '1° Eucaristia'
  | 'Crisma'
  | 'Catequizandos Adultos'
  | 'Catecúmenos Adultos'
  | 'Sementinha'
  | 'Pré-Eucaristia'

export interface classroom {
  id: string
  roomNumber: number
  segment: segment
  startedAt: DateValue | null
  catechists: catechist[]
  catechizings: catechizing[]
}

export type toolBarType = 'classroom' | 'payment' | 'catechizing' | 'catechits'

export const dateType = {} as DateValue
