import { classroom } from '@/Types'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

interface DownloadCallListProps {
  classroom: classroom
}

export async function downloadCallList({
  classroom, // Captura o nome do catequista
}: DownloadCallListProps) {
  const { catechists, catechizings } = classroom

  if (!catechizings || catechizings.length === 0) {
    console.warn('A lista de catequizandos está vazia.')
    return // Adiciona aviso se a lista estiver vazia
  }

  try {
    // Criar uma nova pasta de trabalho
    const workbook = new ExcelJS.Workbook()

    // Carregar o template XLSX
    await workbook.xlsx.load(
      await fetch('/templates/frequency.xlsx').then((res) => res.arrayBuffer()),
    )

    const worksheet = workbook.worksheets[0]

    // Mesclar as células da primeira linha das colunas A à R
    const mergedCell = worksheet.getCell('A1')

    // Verifica se já existe algum texto na célula e adiciona o nome do catequista ao final

    mergedCell.value = `ARQUIDIOCESE DE BRASÍLIA
                   PARÓQUIA NOSSA SENHORA APARECIDA – GAMA / DF 
FREQUÊNCIA ${classroom.segment?.toUpperCase()} (1º SEMESTRE - 2025)
CATEQUISTA:  ${catechists?.map((catechist) => catechist.name.split(' ')[0].toUpperCase()).join(' e ')}` // Adiciona o nome do catequista ao texto existente

    mergedCell.alignment = { horizontal: 'center', vertical: 'middle' } // Centraliza o texto na célula mesclada

    // Preencher os dados
    catechizings.forEach((catechizing, index) => {
      const rowIndex = index + 4 // Ajuste a linha para começar do índice 2 (linha 1 é o cabeçalho)
      const cellNumberRef = `A${rowIndex}` // Coluna "A" para o número
      const cellNameRef = `B${rowIndex}` // Coluna "B" para o nome

      worksheet.getCell(cellNumberRef).value = index + 1 // Preenche o número (começando de 1)
      worksheet.getCell(cellNameRef).value = catechizing.name // Preenche o nome
    })

    const startRow = 4 // A primeira linha de dados
    const endRow = startRow + catechizings.length - 1 // A última linha de dados

    // Aplicar bordas somente nas linhas que têm dados
    for (let row = startRow; row <= endRow; row++) {
      const hasCatechizing = worksheet.getCell(row, 2)
      for (let col = 1; col <= 18; col++) {
        const cell = worksheet.getCell(row, col)

        if (hasCatechizing) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        }
      }
    }

    // Salvar o arquivo Excel com os catequizandos preenchidos
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, 'catequizandos.xlsx')
  } catch (error) {
    console.error('Erro ao baixar a lista de catequizandos:', error)
  }
}
