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
  installment: [
    {
      value: number
      payedAt: string
    },
  ]
  toBePaid: number
}

export interface catechizing {
  id: number
  name: string
  responsible: string
  payment: payment
}
