import { saveAs } from 'file-saver'

// Planilha de importação de catequizandos: modelo para baixar e leitura do
// arquivo preenchido. O servidor confere tudo de novo; aqui só se converte o
// formato da planilha (datas, sim/não, colunas) para o da API.

export const MAX_ROWS_PER_REQUEST = 500
export const MAX_FILE_BYTES = 5 * 1024 * 1024

export interface ImportRow {
  // Linha na planilha (para mostrar o erro no lugar certo)
  sourceRow: number
  name: string
  birthday: string
  address: string
  classroom: string
  hasReceivedBaptism: boolean
  hasReceivedEucharist: boolean
  releasedToGoAwayAlone: boolean
  personWithSpecialNeeds: boolean
  specialNeedsDescription: string
  parents: { name: string; phone: string; kinship: string }[]
}

// O texto de cada coluna é comparado sem acento e em minúsculas, pelo começo
const COLUMNS = [
  { key: 'name', header: 'Nome', match: 'nome', width: 32 },
  {
    key: 'birthday',
    header: 'Nascimento (dd/mm/aaaa)',
    match: 'nascimento',
    width: 24,
  },
  { key: 'address', header: 'Endereço', match: 'endereco', width: 36 },
  { key: 'classroom', header: 'Turma', match: 'turma', width: 28 },
  {
    key: 'baptism',
    header: 'Batizado (sim/não)',
    match: 'batizado',
    width: 18,
  },
  {
    key: 'eucharist',
    header: 'Eucaristia (sim/não)',
    match: 'eucaristia',
    width: 20,
  },
  {
    key: 'alone',
    header: 'Sai sozinho (sim/não)',
    match: 'sai sozinho',
    width: 21,
  },
  {
    key: 'special',
    header: 'Necessidade especial (sim/não)',
    match: 'necessidade',
    width: 28,
  },
  {
    key: 'specialDescription',
    header: 'Descrição da necessidade',
    match: 'descricao',
    width: 30,
  },
  ...[1, 2, 3].flatMap((n) => [
    {
      key: `parent${n}`,
      header: `Responsável ${n}`,
      match: `responsavel ${n}`,
      width: 28,
    },
    {
      key: `phone${n}`,
      header: `Telefone ${n}`,
      match: `telefone ${n}`,
      width: 18,
    },
    {
      key: `kinship${n}`,
      header: `Parentesco ${n}`,
      match: `parentesco ${n}`,
      width: 16,
    },
  ]),
]

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

// Valor de uma célula do ExcelJS, em texto
function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) {
    // O Excel guarda datas sem fuso: o ExcelJS devolve meia-noite UTC
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(
      value.getUTCDate(),
    )}`
  }
  if (typeof value === 'object') {
    const cell = value as {
      text?: unknown
      richText?: { text: string }[]
      result?: unknown
    }
    if (Array.isArray(cell.richText)) {
      return cell.richText.map((part) => part.text).join('')
    }
    if (cell.result !== undefined) return cellText(cell.result)
    if (cell.text !== undefined) return cellText(cell.text)
    return ''
  }
  return String(value).trim()
}

// dd/mm/aaaa (ou dd/mm/aa, ou já AAAA-MM-DD) -> AAAA-MM-DD
function toIsoDate(text: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  const match = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/)
  if (!match) return text
  const [, day, month, rawYear] = match
  let year = Number(rawYear)
  if (rawYear.length === 2)
    year += year > new Date().getFullYear() % 100 ? 1900 : 2000
  return `${year}-${pad(Number(month))}-${pad(Number(day))}`
}

function toFlag(text: string) {
  return ['sim', 's', 'x', '1', 'true', 'yes'].includes(normalize(text))
}

export async function downloadImportTemplate() {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Catequizandos')
  sheet.columns = COLUMNS.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }))
  sheet.getRow(1).font = { bold: true }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  sheet.addRow({
    name: 'Maria da Silva (exemplo, apague esta linha)',
    birthday: '15/03/2015',
    address: 'Quadra 10, Casa 5',
    classroom: 'Nome da turma, como aparece no sistema',
    baptism: 'sim',
    eucharist: 'não',
    alone: 'não',
    special: 'não',
    parent1: 'Joana da Silva',
    phone1: '(61) 99999-0000',
    kinship1: 'Mãe',
  })
  // Datas e telefones como texto: o Excel não reformata nem remove zeros
  sheet.getColumn('birthday').numFmt = '@'
  for (const n of [1, 2, 3]) sheet.getColumn(`phone${n}`).numFmt = '@'

  const instructions = workbook.addWorksheet('Como preencher')
  instructions.getColumn(1).width = 100
  ;[
    'Uma linha por catequizando. Apague a linha de exemplo antes de importar.',
    'Obrigatórios: Nome, Nascimento (dd/mm/aaaa), Endereço e pelo menos um responsável com telefone (turma de adultos dispensa).',
    'Turma: o nome como aparece no sistema. Se a coluna ficar vazia, vale a turma escolhida na hora de importar.',
    'Colunas sim/não: escreva "sim" ou deixe vazio para não.',
    'Telefone: com DDD. Sem DDD, entra o DDD da paróquia.',
    'Quem já está cadastrado (mesmo nome e nascimento) é ignorado, então dá para importar de novo sem duplicar.',
    'Até 3 responsáveis por catequizando.',
  ].forEach((line) => instructions.addRow([line]))

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    'modelo-importacao-catequizandos.xlsx',
  )
}

export class ImportFileError extends Error {}

// Lê a primeira planilha do arquivo. Linhas totalmente vazias são ignoradas
export async function parseImportFile(file: File): Promise<ImportRow[]> {
  if (!/\.xlsx$/i.test(file.name)) {
    throw new ImportFileError(
      'Use o modelo em .xlsx. Se a planilha estiver em outro formato, salve como "Pasta de Trabalho do Excel (.xlsx)".',
    )
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImportFileError('Arquivo grande demais (máximo de 5 MB).')
  }

  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  try {
    await workbook.xlsx.load(await file.arrayBuffer())
  } catch {
    throw new ImportFileError(
      'Não consegui abrir o arquivo. Ele é mesmo um .xlsx?',
    )
  }
  const sheet = workbook.worksheets[0]
  if (!sheet) throw new ImportFileError('A planilha está vazia.')

  // Descobre a coluna de cada campo pelo texto do cabeçalho
  const columnIndex = new Map<string, number>()
  sheet.getRow(1).eachCell((cell, index) => {
    const header = normalize(cellText(cell.value))
    const column = COLUMNS.find(
      (candidate) =>
        !columnIndex.has(candidate.key) && header.startsWith(candidate.match),
    )
    if (column) columnIndex.set(column.key, index)
  })
  for (const required of ['name', 'birthday', 'address']) {
    if (!columnIndex.has(required)) {
      const column = COLUMNS.find((candidate) => candidate.key === required)
      throw new ImportFileError(
        `Não encontrei a coluna "${column?.header}". Use o modelo de planilha.`,
      )
    }
  }

  const read = (rowNumber: number, key: string) => {
    const index = columnIndex.get(key)
    return index ? cellText(sheet.getRow(rowNumber).getCell(index).value) : ''
  }

  const rows: ImportRow[] = []
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const parents = [1, 2, 3]
      .map((n) => ({
        name: read(rowNumber, `parent${n}`),
        phone: read(rowNumber, `phone${n}`),
        kinship: read(rowNumber, `kinship${n}`),
      }))
      .filter((parent) => parent.name || parent.phone)

    const row: ImportRow = {
      sourceRow: rowNumber,
      name: read(rowNumber, 'name'),
      birthday: toIsoDate(read(rowNumber, 'birthday')),
      address: read(rowNumber, 'address'),
      classroom: read(rowNumber, 'classroom'),
      hasReceivedBaptism: toFlag(read(rowNumber, 'baptism')),
      hasReceivedEucharist: toFlag(read(rowNumber, 'eucharist')),
      releasedToGoAwayAlone: toFlag(read(rowNumber, 'alone')),
      personWithSpecialNeeds: toFlag(read(rowNumber, 'special')),
      specialNeedsDescription: read(rowNumber, 'specialDescription'),
      parents,
    }

    const isEmpty =
      !row.name && !row.birthday && !row.address && parents.length === 0
    if (!isEmpty) rows.push(row)
  }
  return rows
}
