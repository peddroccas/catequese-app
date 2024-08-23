export interface catechist {
  id: number
  name: string
  birthday: Date
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
    payedAt: Date
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
  birthday: Date
  address: string
  personWithSpecialNeeds: boolean
  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  hasReceivedMarriage: boolean
  payments?: payment
  parents?: parent
}

type segment =
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
  startedAt?: Date
  catechists: catechist[]
  catechizings: catechizing[]
}
