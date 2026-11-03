import { jsPDF as JsPDF } from 'jspdf'
import autoTable, { RowInput } from 'jspdf-autotable'
import { catechist, classroom, formation, isAdultSegment } from '@/Types'
import { calculateAge, formatDate } from './date'
import { maskPhone } from './phone'

const PARISH_HEADER = [
  'ARQUIDIOCESE DE BRASÍLIA',
  'PARÓQUIA NOSSA SENHORA APARECIDA – GAMA / DF',
]

const headStyles = { fillColor: [46, 59, 76] as [number, number, number] }

function yesOrNo(value: boolean | null) {
  if (value === null) {
    return '-'
  }
  return value ? 'Sim' : 'Não'
}

function writeHeader(doc: JsPDF, lines: string[]) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  PARISH_HEADER.forEach((line, index) => {
    doc.text(line, pageWidth / 2, 12 + index * 5, { align: 'center' })
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  lines.forEach((line, index) => {
    doc.text(line, pageWidth / 2, 25 + index * 5, { align: 'center' })
  })
  return 25 + lines.length * 5 + 2
}

function fileName(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
}

// PDF com todos os dados dos catequizandos de uma turma
export function downloadClassroomPdf(classroom: classroom) {
  const catechizings = [...(classroom.catechizings ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  const isAdult = isAdultSegment(classroom.segment)
  const doc = new JsPDF({ orientation: 'landscape' })

  const startY = writeHeader(doc, [
    `${classroom.segment?.toUpperCase()} – ${classroom.location} (início ${classroom.startedAt})`,
    `CATEQUISTAS: ${classroom.catechists?.map((catechist) => catechist.name).join(', ') || '-'}`,
  ])

  const head = [
    'Nº',
    'Nome',
    'Nascimento',
    'Idade',
    'Endereço',
    'Responsáveis',
    'Batismo',
    '1ª Eucaristia',
    ...(isAdult
      ? ['Matrimônio', 'Estado civil', 'Mora junto']
      : ['Vai sozinho']),
    'Necessidade especial',
  ]

  const body: RowInput[] = catechizings.map((catechizing, index) => [
    index + 1,
    catechizing.name,
    formatDate(catechizing.birthday),
    calculateAge(catechizing.birthday) ?? '-',
    catechizing.address || '-',
    catechizing.parents
      .map((parent) =>
        [parent.name, parent.kinship, maskPhone(parent.phone)]
          .filter(Boolean)
          .join(' – '),
      )
      .join('\n') || '-',
    yesOrNo(catechizing.hasReceivedBaptism),
    yesOrNo(catechizing.hasReceivedEucharist),
    ...(isAdult
      ? [
          yesOrNo(catechizing.hasReceivedMarriage),
          catechizing.maritalStatus ?? '-',
          yesOrNo(catechizing.livesWithPartner),
        ]
      : [yesOrNo(catechizing.releasedToGoAwayAlone)]),
    catechizing.personWithSpecialNeeds
      ? catechizing.specialNeedsDescription || 'Sim'
      : 'Não',
  ])

  autoTable(doc, {
    startY,
    head: [head],
    body,
    styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle' },
    headStyles,
    columnStyles: { 0: { halign: 'center', cellWidth: 8 } },
  })

  doc.save(`turma-${fileName(classroom.location)}.pdf`)
}

// PDF da lista de chamada de uma formação de catequistas
export function downloadFormationPdf(
  formation: formation,
  catechists: catechist[],
) {
  const doc = new JsPDF()
  const startY = writeHeader(doc, [
    'FORMAÇÃO DE CATEQUISTAS',
    `TEMA: ${formation.theme}`,
    `DATA: ${formatDate(formation.date)}`,
  ])

  const rows = formation.attendances
    .map((attendance) => ({
      name:
        catechists.find((catechist) => catechist.id === attendance.catechistId)
          ?.name ?? 'Catequista removido',
      isPresent: attendance.isPresent,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  autoTable(doc, {
    startY,
    head: [['Nº', 'Catequista', 'Presença']],
    body: rows.map((row, index) => [
      index + 1,
      row.name,
      row.isPresent ? 'Presente' : 'Falta',
    ]),
    headStyles,
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      2: { halign: 'center', cellWidth: 30 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        data.cell.styles.textColor =
          data.cell.raw === 'Presente' ? [22, 128, 61] : [185, 28, 28]
      }
    },
  })

  const present = rows.filter((row) => row.isPresent).length
  const finalY = (doc as JsPDF & { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY
  doc.setFontSize(10)
  doc.text(
    `Presentes: ${present}   Faltas: ${rows.length - present}   Total: ${rows.length}`,
    14,
    finalY + 8,
  )

  doc.save(`formacao-${formation.date}-${fileName(formation.theme)}.pdf`)
}
