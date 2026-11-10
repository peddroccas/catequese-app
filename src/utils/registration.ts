import { documentKind, registrationSegment, segment } from '@/Types'

// Etapas do formulário público, como na ficha de inscrição da paróquia
export interface registrationSegmentInfo {
  key: registrationSegment
  title: string
  description: string
  // Faixa de idade da ficha (max vazio = sem limite)
  minAge: number
  maxAge?: number
  // Turmas em que a coordenação pode colocar quem se inscreveu. Só o primeiro
  // ano: as turmas "2" são de quem já está na catequese
  classroomSegments: segment[]
  isAdult: boolean
  // A 1ª Eucaristia só aparece para quem faz Crisma ou a catequese de adultos
  asksEucharist: boolean
}

export const registrationSegments: registrationSegmentInfo[] = [
  {
    key: 'PRE_EUCARISTIA',
    title: 'Pré-Eucaristia',
    description: '6 e 7 anos',
    minAge: 6,
    maxAge: 7,
    classroomSegments: ['Pré-Eucaristia'],
    isAdult: false,
    asksEucharist: false,
  },
  {
    key: 'EUCARISTIA',
    title: 'Eucaristia',
    description: '8 a 12 anos, com duração de 2 anos',
    minAge: 8,
    maxAge: 12,
    classroomSegments: ['Eucaristia 1'],
    isAdult: false,
    asksEucharist: false,
  },
  {
    key: 'CRISMA',
    title: 'Crisma',
    description: '13 a 17 anos, com duração de 2 anos',
    minAge: 13,
    maxAge: 17,
    classroomSegments: ['Crisma 1'],
    isAdult: false,
    asksEucharist: true,
  },
  {
    key: 'ADULTOS',
    title: 'Catequese de Adultos',
    description: '18 anos ou mais, cerca de 1 ano e meio',
    minAge: 18,
    classroomSegments: ['Catequese Adultos'],
    isAdult: true,
    asksEucharist: true,
  },
]

export function getRegistrationSegment(key: registrationSegment) {
  return registrationSegments.find((item) => item.key === key)!
}

export function isAgeOutOfRange(
  info: registrationSegmentInfo,
  age: number | undefined,
) {
  if (age === undefined) {
    return false
  }
  return age < info.minAge || (info.maxAge !== undefined && age > info.maxAge)
}

export function ageRangeLabel(info: registrationSegmentInfo) {
  return info.maxAge === undefined
    ? `${info.minAge} anos ou mais`
    : `${info.minAge} a ${info.maxAge} anos`
}

// Campo do formulário (multipart) de cada documento
export const documentFields: Record<documentKind, string> = {
  PERSON_ID: 'personId',
  GUARDIAN_ID: 'guardianId',
  PROOF_OF_RESIDENCE: 'proofOfResidence',
  BAPTISM: 'baptism',
  EUCHARIST: 'eucharist',
  MARRIAGE: 'marriage',
}

export const documentLabels: Record<documentKind, string> = {
  PERSON_ID: 'Certidão de nascimento ou RG',
  GUARDIAN_ID: 'Documento do responsável (RG ou CNH)',
  PROOF_OF_RESIDENCE: 'Comprovante de residência',
  BAPTISM: 'Lembrança do Batismo',
  EUCHARIST: 'Lembrança da 1ª Eucaristia',
  MARRIAGE: 'Certidão de casamento no religioso',
}

export const documentHints: Partial<Record<documentKind, string>> = {
  MARRIAGE: 'A certidão de casamento civil não é válida.',
}

interface documentRules {
  segment: registrationSegment
  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  maritalStatus?: string
}

// Mesma regra da API: só pede o documento dos sacramentos marcados
export function requiredDocuments({
  segment,
  hasReceivedBaptism,
  hasReceivedEucharist,
  maritalStatus,
}: documentRules): documentKind[] {
  const info = getRegistrationSegment(segment)
  const documents: documentKind[] = ['PERSON_ID']

  if (!info.isAdult) {
    documents.push('GUARDIAN_ID')
  }
  documents.push('PROOF_OF_RESIDENCE')

  if (hasReceivedBaptism) {
    documents.push('BAPTISM')
  }
  if (hasReceivedEucharist && info.asksEucharist) {
    documents.push('EUCHARIST')
  }
  if (info.isAdult && maritalStatus === 'Casado(a) no religioso') {
    documents.push('MARRIAGE')
  }

  return documents
}

export const shirtSizes = [
  '2',
  '4',
  '6',
  '8',
  '10',
  '12',
  '14',
  '16',
  'PP',
  'P',
  'M',
  'G',
  'GG',
  'XG',
]

// Estados civis que a ficha oferece
export const registrationMaritalStatuses = [
  'Solteiro(a)',
  'Namorando',
  'Noivo(a)',
  'Casado(a) no civil',
  'Casado(a) no religioso',
]

// Documentos de sacramentos: quem não os tem precisa falar com a coordenação
export const sacramentDocuments: documentKind[] = [
  'BAPTISM',
  'EUCHARIST',
  'MARRIAGE',
]

// Os documentos são enviados só em PDF
export const MAX_PDF_SIZE = 5 * 1024 * 1024

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
