export interface catechist {
  name: string
}

export const segments = [
  'eucaristia',
  'crisma',
  'catequeseadultos',
  'sementinha',
  'preeucaristia',
]

export interface classroom {
  catechist: number[]
  catechizing: string[]
  segment: string
  classNumber: number
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

export interface catechizing {
  id: number
  name: string
  responsible: string
  payment: payment
}
