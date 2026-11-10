import { classroom, meeting } from '@/Types'
import { saveAs } from 'file-saver'
import { attendanceRate, buildAttendanceMatrix } from './attendanceMatrix'
import { formatDate } from './date'
import { parishHeaderLines } from './parish'

function fileName(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
}

const BORDER = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
} as const

// Excel do mapa de frequência: aba com P/F por encontro e aba com os temas
export async function downloadAttendanceMatrixExcel(
  classroom: classroom,
  meetings: meeting[],
) {
  const { columns, rows } = buildAttendanceMatrix(classroom, meetings)
  const title = classroom.name ?? classroom.location

  // A biblioteca de planilhas é pesada: só é carregada neste momento
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Frequência')
  const lastColumn = 2 + columns.length + 2

  sheet.addRow([
    `${parishHeaderLines().join('\n')}\nMAPA DE FREQUÊNCIA – ${title} (${classroom.segment})`,
  ])
  sheet.mergeCells(1, 1, 1, lastColumn)
  sheet.getRow(1).height = 62
  sheet.getCell(1, 1).alignment = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  }
  sheet.getCell(1, 1).font = { bold: true }

  const header = sheet.addRow([
    'Nº',
    'Catequizando',
    ...columns.map((meeting) => formatDate(meeting.date).slice(0, 5)),
    'Faltas',
    'Frequência',
  ])
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E3B4C' },
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = BORDER
  })

  rows.forEach((person, index) => {
    const rate = attendanceRate(person)
    const row = sheet.addRow([
      index + 1,
      person.isInClassroom ? person.name : `${person.name} (saiu da turma)`,
      ...person.cells.map((cell) =>
        cell === true ? 'P' : cell === false ? 'F' : '',
      ),
      person.absent,
      rate === undefined ? '' : `${rate}%`,
    ])
    row.eachCell((cell, column) => {
      cell.border = BORDER
      if (column !== 2) {
        cell.alignment = { horizontal: 'center' }
      }
      if (cell.value === 'P') {
        cell.font = { bold: true, color: { argb: 'FF15803D' } }
      }
      if (cell.value === 'F') {
        cell.font = { bold: true, color: { argb: 'FFB91C1C' } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEE2E2' },
        }
      }
    })
  })

  sheet.getColumn(1).width = 5
  sheet.getColumn(2).width = 38
  columns.forEach((_, index) => {
    sheet.getColumn(3 + index).width = 7
  })
  sheet.getColumn(lastColumn - 1).width = 8
  sheet.getColumn(lastColumn).width = 12
  sheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }]

  const themesSheet = workbook.addWorksheet('Temas dos encontros')
  themesSheet.addRow(['Data', 'Temas']).font = { bold: true }
  columns.forEach((meeting) => {
    themesSheet.addRow([
      formatDate(meeting.date),
      meeting.themes.map((theme) => theme.name).join('\n'),
    ])
  })
  themesSheet.getColumn(1).width = 12
  themesSheet.getColumn(2).width = 100
  themesSheet.eachRow((row) => {
    row.alignment = { vertical: 'top', wrapText: true }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `frequencia-${fileName(title)}.xlsx`,
  )
}
