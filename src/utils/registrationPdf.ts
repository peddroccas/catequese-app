import { catechizing, classroom, isAdultSegment, registration } from '@/Types'
import { AxiosError } from 'axios'
import { saveAs } from 'file-saver'
import { unzipSync, zipSync } from 'fflate'
import { jsPDF as JsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CatechizingDocumentRepository } from '@/services/repositories/catechizingDocumentRepository'
import { RegistrationRepository } from '@/services/repositories/registrationRepository'
import { calculateAge, formatDate } from './date'
import { mergeIntoOnePdf, sortZipEntries } from './pdfPackage'
import { maskPhone } from './phone'
import { parishHeaderLines } from './parish'
import { getRegistrationSegment } from './registration'

// Ano da catequese da ficha de inscrição (muda a cada ciclo de inscrições)
const CATECHESIS_YEAR = 2027

function yesOrNo(value: boolean | null) {
  if (value === null) {
    return '-'
  }
  return value ? 'Sim' : 'Não'
}

function fileSafe(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
}

// Os dados que entram na ficha, vindos de uma inscrição ou de um catequizando
interface ficha {
  heading: string
  subtitle: string
  fileName: string
  isAdult: boolean
  // Mostra a linha da 1ª Eucaristia (Crisma, adultos ou quem já a recebeu)
  asksEucharist: boolean
  name: string
  birthday: string
  address: string
  parents: { name: string; phone: string; kinship: string }[]
  personWithSpecialNeeds: boolean
  specialNeedsDescription: string | null
  foodRestriction: string | null
  releasedToGoAwayAlone: boolean
  pickupAuthorizedBy: string | null
  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  shirtSize: string | null
  maritalStatus: string | null
  livesWithPartner: boolean | null
  // Linhas extras no começo (ex.: a turma)
  extraRows?: [string, string][]
  documents?: string[]
  // Quando o termo foi aceito online; sem isso a ficha sai para assinar na mão
  termsAcceptedAt?: string
}

// Ficha no modelo da paróquia, com o termo de compromisso para imprimir e assinar.
// Só monta o PDF: quem chama decide se baixa direto ou coloca num ZIP
function buildFichaPdf(data: ficha) {
  const doc = new JsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  parishHeaderLines().forEach((line, index) => {
    doc.text(line, pageWidth / 2, 14 + index * 5, { align: 'center' })
  })
  doc.setFontSize(12)
  doc.text(data.heading, pageWidth / 2, 30, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(data.subtitle, pageWidth / 2, 36, { align: 'center' })

  const age = calculateAge(data.birthday)
  const parents = data.parents
    .map(
      (parent) =>
        `${parent.name} (${parent.kinship})${parent.phone ? ` – ${maskPhone(parent.phone)}` : ''}`,
    )
    .join('\n')

  const rows: [string, string][] = [
    ...(data.extraRows ?? []),
    ['Nome', data.name],
    [
      'Data de nascimento',
      `${formatDate(data.birthday)}${age === undefined ? '' : ` (${age} anos)`}`,
    ],
    ['Endereço', data.address],
    [data.isAdult ? 'Contato (WhatsApp)' : 'Responsáveis', parents || '-'],
    [
      'Necessidade ou atenção especial',
      data.personWithSpecialNeeds
        ? `Sim – ${data.specialNeedsDescription ?? ''}`
        : 'Não',
    ],
    [
      'Restrição alimentar',
      data.foodRestriction ? `Sim – ${data.foodRestriction}` : 'Não',
    ],
  ]

  if (!data.isAdult) {
    rows.push([
      'Autorizado a ir embora sozinho',
      data.releasedToGoAwayAlone
        ? 'Sim'
        : `Não – quem busca: ${data.pickupAuthorizedBy ?? '-'}`,
    ])
  }
  rows.push(['Batismo', yesOrNo(data.hasReceivedBaptism)])
  if (data.asksEucharist) {
    rows.push(['1ª Eucaristia', yesOrNo(data.hasReceivedEucharist)])
  }
  rows.push(['Camiseta (sujeito a confirmação)', data.shirtSize ?? '-'])
  if (data.isAdult) {
    rows.push(
      ['Estado civil', data.maritalStatus ?? '-'],
      ['Mora junto', yesOrNo(data.livesWithPartner)],
    )
  }
  if (data.documents) {
    rows.push(['Documentos enviados', data.documents.join('\n') || '-'])
  }

  autoTable(doc, {
    startY: 42,
    body: rows,
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 2.5, textColor: 30 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, fillColor: [245, 247, 250] },
    },
  })

  const finalY = (doc as JsPDF & { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TERMO DE COMPROMISSO', pageWidth / 2, finalY + 12, {
    align: 'center',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)

  // Se o termo já foi aceito online as respostas saem marcadas; senão, em branco
  const sim = data.termsAcceptedAt ? '(X)' : '( )'
  const signer = data.isAdult
    ? data.name
    : (data.parents[0]?.name ?? '______________________')
  const term = [
    `Você está ciente do horário da catequese: todos os domingos das 8h às 11h30, iniciando com a Santa Missa?  ${sim} Sim  ( ) Não`,
    `Você está ciente da obrigatoriedade da presença nos encontros e na Missa?  ${sim} Sim  ( ) Não`,
    `Eu, ${signer}, ${data.isAdult ? 'catequizando(a) adulto(a)' : `responsável por ${data.name}`}, assumo o reto compromisso com a assídua presença nos encontros catequéticos aos domingos, iniciados às 8h com a Santa Missa e finalizando às 11h30. Me comprometo a estar presente nos dias de festa de preceito e nos eventos, assim como com a presença nas reuniões com os catequistas. Tenho conhecimento que a ausência e falta de preparo inviabilizará o recebimento dos sacramentos no tempo oportuno e assino declarando que concordo com o seguinte termo.`,
  ]
  let y = finalY + 20
  for (const paragraph of term) {
    const lines = doc.splitTextToSize(paragraph, pageWidth - 28) as string[]
    doc.text(lines, 14, y)
    y += lines.length * 4.6 + 3
  }

  y += 14
  doc.line(pageWidth / 2 - 55, y, pageWidth / 2 + 55, y)
  doc.text(
    data.isAdult ? 'Assinatura do catequizando' : 'Assinatura do responsável',
    pageWidth / 2,
    y + 5,
    { align: 'center' },
  )
  if (data.termsAcceptedAt) {
    doc.setFontSize(8.5)
    doc.text(
      `Termo aceito online em ${new Date(data.termsAcceptedAt).toLocaleString('pt-BR')}.`,
      pageWidth / 2,
      y + 11,
      { align: 'center' },
    )
  }

  return { doc, fileName: data.fileName }
}

// Dados da ficha de uma inscrição enviada pelo formulário público
function registrationFicha(registration: registration): ficha {
  const info = getRegistrationSegment(registration.segment)

  return {
    heading: `FICHA DE INSCRIÇÃO PARA A CATEQUESE DE ${CATECHESIS_YEAR}`,
    subtitle: `${info.title} · Código ${registration.protocol}`,
    fileName: `ficha-${fileSafe(registration.name)}.pdf`,
    isAdult: info.isAdult,
    asksEucharist: info.asksEucharist,
    name: registration.name,
    birthday: registration.birthday,
    address: registration.address,
    parents: registration.parents,
    personWithSpecialNeeds: registration.personWithSpecialNeeds,
    specialNeedsDescription: registration.specialNeedsDescription,
    foodRestriction: registration.foodRestriction,
    releasedToGoAwayAlone: registration.releasedToGoAwayAlone,
    pickupAuthorizedBy: registration.pickupAuthorizedBy,
    hasReceivedBaptism: registration.hasReceivedBaptism,
    hasReceivedEucharist: registration.hasReceivedEucharist,
    shirtSize: registration.shirtSize,
    maritalStatus: registration.maritalStatus,
    livesWithPartner: registration.livesWithPartner,
    documents: registration.files.map((file) => file.label),
    termsAcceptedAt: registration.termsAcceptedAt,
  }
}

// Só a ficha da inscrição, para imprimir e assinar
export function downloadRegistrationPdf(registration: registration) {
  const { doc, fileName } = buildFichaPdf(registrationFicha(registration))

  doc.save(fileName)
}

// Dados da ficha de um catequizando (também dos cadastrados à mão). A turma,
// se houver, vai na primeira linha
function catechizingFicha(
  catechizing: catechizing,
  classroom?: classroom,
): ficha {
  const isAdult = classroom?.segment
    ? isAdultSegment(classroom.segment)
    : (calculateAge(catechizing.birthday) ?? 0) >= 18
  const classroomLabel = classroom
    ? `${classroom.name ?? classroom.location}${classroom.segment ? ` (${classroom.segment})` : ''}`
    : undefined

  return {
    heading: 'FICHA DO CATEQUIZANDO',
    subtitle: classroomLabel ?? 'Catequese',
    fileName: `ficha-${fileSafe(catechizing.name)}.pdf`,
    isAdult,
    asksEucharist:
      isAdult ||
      catechizing.hasReceivedEucharist ||
      Boolean(classroom?.segment?.startsWith('Crisma')),
    name: catechizing.name,
    birthday: catechizing.birthday ?? '',
    address: catechizing.address,
    parents: catechizing.parents,
    personWithSpecialNeeds: catechizing.personWithSpecialNeeds,
    specialNeedsDescription: catechizing.specialNeedsDescription,
    foodRestriction: catechizing.foodRestriction ?? null,
    releasedToGoAwayAlone: catechizing.releasedToGoAwayAlone,
    pickupAuthorizedBy: catechizing.pickupAuthorizedBy ?? null,
    hasReceivedBaptism: catechizing.hasReceivedBaptism,
    hasReceivedEucharist: catechizing.hasReceivedEucharist,
    shirtSize: catechizing.shirtSize ?? null,
    maritalStatus: catechizing.maritalStatus,
    livesWithPartner: catechizing.livesWithPartner,
    extraRows: classroomLabel ? [['Turma', classroomLabel]] : undefined,
  }
}

// Só a ficha, para imprimir e assinar
export function downloadCatechizingPdf(
  catechizing: catechizing,
  classroom?: classroom,
) {
  const { doc, fileName } = buildFichaPdf(
    catechizingFicha(catechizing, classroom),
  )

  doc.save(fileName)
}

export type packageFormat = 'zip' | 'pdf'

export interface packageResult {
  hadDocuments: boolean
  // Arquivos que não deu para juntar no PDF único (seguem no ZIP)
  skipped: string[]
}

// Ficha + todos os documentos de uma vez, em ZIP (arquivos separados, a ficha
// primeiro) ou em um PDF só, na ordem ficha e documentos, bom para imprimir.
// Sem documentos, baixa só a ficha. Os documentos só a coordenação acessa: a
// API recusa os demais
async function savePackage({
  doc,
  fileName,
  ownerName,
  format,
  loadZip,
}: {
  doc: JsPDF
  fileName: string
  ownerName: string
  format: packageFormat
  loadZip: () => Promise<Blob>
}): Promise<packageResult> {
  let documents: Record<string, Uint8Array> = {}
  try {
    const zip = await loadZip()
    documents = unzipSync(new Uint8Array(await zip.arrayBuffer()))
  } catch (error) {
    // 404 = ainda não tem documentos; qualquer outro erro o chamador mostra
    if (!(error instanceof AxiosError && error.response?.status === 404)) {
      throw error
    }
  }

  if (!Object.keys(documents).length) {
    doc.save(fileName)
    return { hadDocuments: false, skipped: [] }
  }

  const fichaBytes = new Uint8Array(doc.output('arraybuffer'))

  if (format === 'zip') {
    // PDFs já são comprimidos: só empacota (level 0)
    saveAs(
      new Blob(
        [zipSync({ '0 - Ficha.pdf': fichaBytes, ...documents }, { level: 0 })],
        {
          type: 'application/zip',
        },
      ),
      `Ficha e documentos - ${ownerName}.zip`,
    )
    return { hadDocuments: true, skipped: [] }
  }

  const { bytes, skipped } = await mergeIntoOnePdf([
    { name: 'Ficha', bytes: fichaBytes },
    ...sortZipEntries(documents),
  ])
  saveAs(
    new Blob([bytes], { type: 'application/pdf' }),
    `Ficha e documentos - ${ownerName}.pdf`,
  )
  return { hadDocuments: true, skipped }
}

// Perfil do catequizando (só coordenação)
export function downloadCatechizingPackage(
  catechizing: catechizing,
  format: packageFormat,
  classroom?: classroom,
) {
  const { doc, fileName } = buildFichaPdf(
    catechizingFicha(catechizing, classroom),
  )

  return savePackage({
    doc,
    fileName,
    ownerName: catechizing.name,
    format,
    loadZip: () => CatechizingDocumentRepository.downloadZip(catechizing.id!),
  })
}

// Conferência da inscrição (só coordenação)
export function downloadRegistrationPackage(
  registration: registration,
  format: packageFormat,
) {
  const { doc, fileName } = buildFichaPdf(registrationFicha(registration))

  return savePackage({
    doc,
    fileName,
    ownerName: registration.name,
    format,
    loadZip: () => RegistrationRepository.downloadZip(registration.id),
  })
}

// Texto para a coordenação quando algum arquivo ficou fora do PDF único. Os
// "AVISO arquivo ausente" vêm da API quando o arquivo sumiu do armazenamento
export function describeSkipped(skipped: string[]) {
  const isMissing = (name: string) => /AVISO arquivo ausente/.test(name)
  const missing = skipped
    .filter(isMissing)
    .map((name) =>
      name.replace(/^\d+ - AVISO arquivo ausente - /, '').replace(/\.txt$/, ''),
    )
  const others = skipped.filter((name) => !isMissing(name))
  const parts: string[] = []

  if (missing.length) {
    parts.push(
      `Não estão mais no armazenamento: ${missing.join(', ')}. Envie de novo pelo Editar.`,
    )
  }
  if (others.length) {
    parts.push(
      `Não deu para juntar no PDF: ${others.join(', ')}. Baixe pelo ZIP.`,
    )
  }
  return parts.join(' ')
}
