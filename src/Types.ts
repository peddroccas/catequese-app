export interface catechist {
  id?: string
  name: string
  birthday: string | undefined
  phone: string
  address: string
  classroomId: string | undefined

  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  hasReceivedConfirmation: boolean
  hasReceivedMarriage: boolean

  email?: string
}

export interface payment {
  id: string
  toBePaid: number
  installments: {
    id: string
    payedAt: string | undefined
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
  id?: string
  name: string
  birthday: string | undefined
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
  id?: string
  roomNumber: number | undefined
  segment: segment | undefined
  startedAt: number | undefined
  catechists: catechist[]
  catechizings?: catechizing[]
}

export type toolBarType = 'classroom' | 'payment' | 'catechizing' | 'catechits'
