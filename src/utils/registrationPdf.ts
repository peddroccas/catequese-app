import { registration } from '@/Types'
import { jsPDF as JsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calculateAge, formatDate } from './date'
import { maskPhone } from './phone'
import { getRegistrationSegment } from './registration'

// Ano da catequese da ficha (muda a cada ciclo de inscrições)
const CATECHESIS_YEAR = 2027

const PARISH_HEADER = [
  'ARQUIDIOCESE DE BRASÍLIA',
  'PARÓQUIA NOSSA SENHORA APARECIDA – GAMA / DF',
]

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

// Ficha preenchida no modelo da paróquia, com o termo de compromisso para imprimir e assinar
export function downloadRegistrationPdf(registration: registration) {
  const info = getRegistrationSegment(registration.segment)
  const doc = new JsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  PARISH_HEADER.forEach((line, index) => {
    doc.text(line, pageWidth / 2, 14 + index * 5, { align: 'center' })
  })
  doc.setFontSize(12)
  doc.text(
    `FICHA DE INSCRIÇÃO PARA A CATEQUESE DE ${CATECHESIS_YEAR}`,
    pageWidth / 2,
    30,
    { align: 'center' },
  )
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(
    `${info.title} · Código ${registration.protocol}`,
    pageWidth / 2,
    36,
    { align: 'center' },
  )

  const age = calculateAge(registration.birthday)
  const parents = registration.parents
    .map(
      (parent) =>
        `${parent.name} (${parent.kinship})${parent.phone ? ` – ${maskPhone(parent.phone)}` : ''}`,
    )
    .join('\n')

  const rows: [string, string][] = [
    ['Nome', registration.name],
    [
      'Data de nascimento',
      `${formatDate(registration.birthday)}${age === undefined ? '' : ` (${age} anos)`}`,
    ],
    ['Endereço', registration.address],
    [info.isAdult ? 'Contato (WhatsApp)' : 'Responsáveis', parents],
    [
      'Necessidade ou atenção especial',
      registration.personWithSpecialNeeds
        ? `Sim – ${registration.specialNeedsDescription ?? ''}`
        : 'Não',
    ],
    [
      'Restrição alimentar',
      registration.foodRestriction
        ? `Sim – ${registration.foodRestriction}`
        : 'Não',
    ],
  ]

  if (!info.isAdult) {
    rows.push([
      'Autorizado a ir embora sozinho',
      registration.releasedToGoAwayAlone
        ? 'Sim'
        : `Não – quem busca: ${registration.pickupAuthorizedBy ?? '-'}`,
    ])
  }
  rows.push(['Batismo', yesOrNo(registration.hasReceivedBaptism)])
  if (info.asksEucharist) {
    rows.push(['1ª Eucaristia', yesOrNo(registration.hasReceivedEucharist)])
  }
  rows.push(['Camiseta (sujeito a confirmação)', registration.shirtSize ?? '-'])
  if (info.isAdult) {
    rows.push(
      ['Estado civil', registration.maritalStatus ?? '-'],
      ['Mora junto', yesOrNo(registration.livesWithPartner)],
    )
  }
  rows.push([
    'Documentos enviados',
    registration.files.map((file) => file.label).join('\n') || '-',
  ])

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

  const signer = info.isAdult
    ? registration.name
    : (registration.parents[0]?.name ?? '______________________')
  const term = [
    `Você está ciente do horário da catequese: todos os domingos das 8h às 11h30, iniciando com a Santa Missa?  (X) Sim  ( ) Não`,
    `Você está ciente da obrigatoriedade da presença nos encontros e na Missa?  (X) Sim  ( ) Não`,
    `Eu, ${signer}, ${info.isAdult ? 'catequizando(a) adulto(a)' : `responsável por ${registration.name}`}, assumo o reto compromisso com a assídua presença nos encontros catequéticos aos domingos, iniciados às 8h com a Santa Missa e finalizando às 11h30. Me comprometo a estar presente nos dias de festa de preceito e nos eventos, assim como com a presença nas reuniões com os catequistas. Tenho conhecimento que a ausência e falta de preparo inviabilizará o recebimento dos sacramentos no tempo oportuno e assino declarando que concordo com o seguinte termo.`,
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
    info.isAdult ? 'Assinatura do catequizando' : 'Assinatura do responsável',
    pageWidth / 2,
    y + 5,
    { align: 'center' },
  )
  doc.setFontSize(8.5)
  doc.text(
    `Termo aceito online em ${new Date(registration.termsAcceptedAt).toLocaleString('pt-BR')}.`,
    pageWidth / 2,
    y + 11,
    { align: 'center' },
  )

  doc.save(`ficha-${fileSafe(registration.name)}.pdf`)
}
