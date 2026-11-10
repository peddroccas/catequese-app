import { jsPDF as JsPDF } from 'jspdf'
import autoTable, { RowInput } from 'jspdf-autotable'
import {
  catechist,
  classroom,
  formation,
  isAdultSegment,
  meeting,
} from '@/Types'
import { attendanceRate, buildAttendanceMatrix } from './attendanceMatrix'
import { calculateAge, formatDate } from './date'
import { parishHeaderLines } from './parish'
import { maskPhone } from './phone'

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
  parishHeaderLines().forEach((line, index) => {
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
    ...(formation.instructor ? [`FORMADOR(A): ${formation.instructor}`] : []),
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

// Chamada de um encontro da turma (um ou mais temas)
export function downloadMeetingPdf(meeting: meeting, classroom: classroom) {
  const doc = new JsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const themeLines = meeting.themes.flatMap((theme) =>
    doc.splitTextToSize(`• ${theme.name}`, pageWidth - 40),
  )
  const startY = writeHeader(doc, [
    'CHAMADA DO ENCONTRO',
    `TURMA: ${classroom.name ?? classroom.location} (${classroom.segment})`,
    `DATA: ${formatDate(meeting.date)}`,
    meeting.themes.length > 1 ? 'TEMAS:' : 'TEMA:',
    ...themeLines,
  ])

  const rows = meeting.attendances
    .map((attendance) => ({
      name: attendance.catechizingName ?? 'Catequizando removido',
      isPresent: attendance.isPresent,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  autoTable(doc, {
    startY,
    head: [['Nº', 'Catequizando', 'Presença']],
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

  doc.save(
    `chamada-${fileName(classroom.name ?? classroom.location)}-${meeting.date}.pdf`,
  )
}

// Quantas datas cabem por página do mapa de frequência (paisagem)
const MATRIX_DATES_PER_PAGE = 15

// Mapa de frequência da turma (paisagem): catequizandos x encontros. Os
// encontros são divididos em páginas de até MATRIX_DATES_PER_PAGE datas (o
// nome se repete em todas); faltas e frequência ficam na última página. A
// lista de temas de cada data vem no final.
export function downloadAttendanceMatrixPdf(
  classroom: classroom,
  meetings: meeting[],
) {
  const { columns, rows } = buildAttendanceMatrix(classroom, meetings)
  const title = classroom.name ?? classroom.location
  const doc = new JsPDF({ orientation: 'landscape' })

  const pages: number[] = []
  for (let start = 0; start < columns.length; start += MATRIX_DATES_PER_PAGE) {
    pages.push(start)
  }
  const pageCount = pages.length

  pages.forEach((offset, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage()
    }
    const pageColumns = columns.slice(offset, offset + MATRIX_DATES_PER_PAGE)
    const isLastPage = pageIndex === pageCount - 1
    const dateCount = pageColumns.length

    const startY = writeHeader(doc, [
      'MAPA DE FREQUÊNCIA',
      `TURMA: ${title} (${classroom.segment})`,
      pageCount > 1
        ? `ENCONTROS ${offset + 1} A ${offset + dateCount} DE ${columns.length} (PÁGINA ${pageIndex + 1} DE ${pageCount})`
        : `${columns.length} ENCONTRO${columns.length === 1 ? '' : 'S'}`,
    ])

    autoTable(doc, {
      startY,
      head: [
        [
          'Nº',
          'Catequizando',
          ...pageColumns.map((meeting) => formatDate(meeting.date).slice(0, 5)),
          ...(isLastPage ? ['Faltas', 'Freq.'] : []),
        ],
      ],
      body: rows.map((person, index) => {
        const rate = attendanceRate(person)
        return [
          index + 1,
          person.isInClassroom ? person.name : `${person.name} (saiu da turma)`,
          ...person.cells
            .slice(offset, offset + dateCount)
            .map((cell) => (cell === true ? 'P' : cell === false ? 'F' : '-')),
          ...(isLastPage
            ? [person.absent, rate === undefined ? '-' : `${rate}%`]
            : []),
        ]
      }),
      headStyles: { ...headStyles, halign: 'center', fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 70 },
        ...Object.fromEntries(
          pageColumns.map((_, index) => [
            2 + index,
            { halign: 'center', cellWidth: 12 },
          ]),
        ),
        [2 + dateCount]: { halign: 'center', cellWidth: 16 },
        [3 + dateCount]: { halign: 'center', cellWidth: 16 },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') {
          return
        }
        const isDateColumn =
          data.column.index >= 2 && data.column.index < 2 + dateCount
        if (isDateColumn && data.cell.raw === 'P') {
          data.cell.styles.textColor = [22, 128, 61]
        }
        if (isDateColumn && data.cell.raw === 'F') {
          data.cell.styles.textColor = [185, 28, 28]
          data.cell.styles.fillColor = [254, 226, 226]
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })

    if (!isLastPage) {
      const tableEnd = (doc as JsPDF & { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY
      doc.setFontSize(8)
      doc.text(
        'Faltas e frequência de cada catequizando na última página.',
        14,
        tableEnd + 6,
      )
    }
  })

  const finalY = (doc as JsPDF & { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY
  doc.setFontSize(8)
  doc.text('P = presente   F = falta   - = sem registro', 14, finalY + 6)

  autoTable(doc, {
    startY: finalY + 10,
    head: [['Data', 'Temas do encontro']],
    body: columns.map((meeting) => [
      formatDate(meeting.date),
      meeting.themes.map((theme) => theme.name).join('\n'),
    ]),
    headStyles,
    styles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 24 } },
  })

  doc.save(`frequencia-${fileName(title)}.pdf`)
}
