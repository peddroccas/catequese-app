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
  // Opções da ficha de inscrição
  'Namorando',
  'Noivo(a)',
  'Casado(a) no civil',
  'Casado(a) no religioso',
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
  // Vêm da ficha de inscrição
  shirtSize?: string | null
  foodRestriction?: string | null
  // Quem pode buscar quando não vai embora sozinho
  pickupAuthorizedBy?: string | null
  // Só preenchidos em turmas de adultos
  maritalStatus: maritalStatus | null
  livesWithPartner: boolean | null
  classroomId?: string
  parents: parent[]
  archivedAt?: string | null
}

// Grupos e colunas aceitos pela listagem paginada de catequizandos
export type catechizingGroup = 'all' | 'eucharist' | 'confirmation' | 'adults'
export type catechizingSortColumn = 'name' | 'age' | 'baptism'
export type sortDirection = 'asc' | 'desc'

export interface catechizingsPage {
  items: catechizing[]
  page: number
  pageSize: number
  // Tudo que bate com a busca e o grupo, somando todas as páginas
  total: number
  totalPages: number
  // Totais por grupo, sem considerar a busca nem o grupo escolhido
  counts: Record<catechizingGroup, number>
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

// Agrupamento usado nas telas (turmas, ritos): as etapas 1 e 2 ficam juntas
export const segmentGroups: { label: string; segments: segment[] }[] = [
  {
    label: 'Eucaristia',
    segments: ['Pré-Eucaristia', 'Eucaristia 1', 'Eucaristia 2'],
  },
  { label: 'Crisma', segments: ['Crisma 1', 'Crisma 2'] },
  { label: 'Catequese Adultos', segments: ['Catequese Adultos'] },
]

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

export type paymentMethod = 'PIX' | 'CASH' | 'CARD'

export const paymentMethods: paymentMethod[] = ['PIX', 'CASH', 'CARD']

export const paymentMethodLabels: Record<paymentMethod, string> = {
  PIX: 'Pix',
  CASH: 'Dinheiro',
  CARD: 'Cartão',
}

export type entrySource = 'COLLABORATION' | 'CARNE' | 'DONATION' | 'PARISH'

export const entrySources: entrySource[] = [
  'COLLABORATION',
  'CARNE',
  'DONATION',
  'PARISH',
]

export const entrySourceLabels: Record<entrySource, string> = {
  COLLABORATION: 'Colaboração do caixa',
  CARNE: 'Carnê',
  DONATION: 'Doação',
  PARISH: 'Pago pela paróquia',
}

// Saída do caixa. Valores em centavos
export interface expense {
  id?: string
  // Destinação: com o que foi gasto
  description: string
  amountCents: number
  date: string
  paymentMethod: paymentMethod
  createdByName?: string | null
}

// Entrada no caixa. Pagamentos do carnê são entradas de origem CARNE
export interface entry {
  id?: string
  source: entrySource
  amountCents: number
  date: string
  paymentMethod: paymentMethod
  // Quem pagou (obrigatório no carnê)
  payerName?: string | null
  description?: string | null
  // Só no carnê
  catechizingId?: string | null
  catechizingName?: string | null
  createdByName?: string | null
}

export interface carne {
  // Valor total do carnê de cada catequizando, em centavos
  totalCents: number
  payments: entry[]
}

// PDF de um rito: URL pública e o nome original do arquivo
export interface riteFile {
  id: string
  name: string
  url: string
}

// Rito da catequese, com os PDFs do roteiro. Vale para todas as turmas
export interface rite {
  id?: string
  name: string
  description?: string | null
  // PDFs do rito (pode ter mais de um, ex.: roteiro e folder)
  files: riteFile[]
}

// Inscrição enviada pelo formulário público, conferida pela coordenação
export type registrationSegment =
  | 'PRE_EUCARISTIA'
  | 'EUCARISTIA'
  | 'CRISMA'
  | 'ADULTOS'

export type registrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// Abre/fecha o formulário público e escolhe as etapas que recebem inscrição
export interface registrationSettings {
  isOpen: boolean
  openSegments: registrationSegment[]
}

export type documentKind =
  | 'PERSON_ID'
  | 'GUARDIAN_ID'
  | 'PROOF_OF_RESIDENCE'
  | 'BAPTISM'
  | 'EUCHARIST'
  | 'MARRIAGE'

// Documento guardado no perfil do catequizando (só a coordenação vê)
export interface catechizingDocument {
  id: string
  kind: documentKind
  label: string
  originalName: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

export interface registrationFile {
  id: string
  kind: documentKind
  label: string
  originalName: string
  mimeType: string
  sizeBytes: number
}

export interface registration {
  id: string
  // Código curto que a família cita ao falar com a coordenação
  protocol: string
  segment: registrationSegment
  status: registrationStatus
  name: string
  birthday: string
  address: string
  personWithSpecialNeeds: boolean
  specialNeedsDescription: string | null
  foodRestriction: string | null
  releasedToGoAwayAlone: boolean
  pickupAuthorizedBy: string | null
  shirtSize: string | null
  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  hasReceivedMarriage: boolean
  maritalStatus: string | null
  livesWithPartner: boolean | null
  parents: parent[]
  files: registrationFile[]
  rejectionReason: string | null
  reviewedAt: string | null
  reviewedByName: string | null
  catechizingId: string | null
  // Quando a família concordou com o termo de compromisso
  termsAcceptedAt: string
  createdAt: string
}

// Paróquia (cliente do sistema). O que qualquer pessoa pode ver, sem login,
// e o que a coordenação vê e edita
export interface coordinationContact {
  name: string
  phone: string
}

export interface publicParish {
  slug: string
  name: string
  dioceseName: string
  city: string
  // UF
  state: string
  // DDD usado para completar telefones sem ele
  areaCode: string
  logoUrl: string | null
  primaryColor: string | null
  coordinationContacts: coordinationContact[]
  // Taxa de inscrição em centavos; null = sem taxa
  registrationFeeCents: number | null
  // Termo de compromisso; null = termo padrão do sistema
  commitmentTerms: string | null
}

export interface parish extends publicParish {
  id: string
  // Valor total do carnê de cada catequizando, em centavos
  carneAmountCents: number
  status: 'ACTIVE' | 'SUSPENDED'
  plan: string
  paidUntil: string | null
  customDomain: string | null
}

// O que a coordenação pode alterar
export type parishChanges = Pick<
  parish,
  | 'name'
  | 'dioceseName'
  | 'city'
  | 'state'
  | 'areaCode'
  | 'logoUrl'
  | 'primaryColor'
  | 'coordinationContacts'
  | 'carneAmountCents'
  | 'registrationFeeCents'
  | 'commitmentTerms'
>

// Painel do administrador do sistema
export interface adminParish {
  id: string
  slug: string
  name: string
  city: string
  state: string
  status: 'ACTIVE' | 'SUSPENDED'
  plan: string
  paidUntil: string | null
  customDomain: string | null
  createdAt: string
  catechizingsCount: number
  catechistsCount: number
  classroomsCount: number
  coordinators: { name: string; email: string }[]
}

export interface createAdminParish {
  slug: string
  name: string
  dioceseName: string
  city: string
  state: string
  areaCode: string
  plan?: string
  coordinatorName: string
  coordinatorEmail: string
  coordinatorPhone?: string
}

export interface auditLogEntry {
  id: string
  actorName: string
  action: string
  targetType: string
  targetId: string | null
  detail: string | null
  createdAt: string
}
