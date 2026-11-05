import { PDFDocument } from 'pdf-lib'

export interface pdfPart {
  // Nome mostrado se não der para juntar
  name: string
  bytes: Uint8Array
}

// Todo PDF começa com %PDF-: confere pelo conteúdo, não pelo nome
function isPdf(bytes: Uint8Array) {
  return String.fromCharCode(...bytes.subarray(0, 5)) === '%PDF-'
}

// Junta os PDFs num só, na ordem recebida. O que não der para juntar (arquivo
// danificado ou que não é PDF) é pulado e seu nome volta em `skipped`: segue
// disponível no ZIP
export async function mergeIntoOnePdf(parts: pdfPart[]) {
  const merged = await PDFDocument.create()
  const skipped: string[] = []

  for (const part of parts) {
    try {
      if (!isPdf(part.bytes)) {
        skipped.push(part.name)
        continue
      }

      const source = await PDFDocument.load(part.bytes, {
        ignoreEncryption: true,
      })
      const pages = await merged.copyPages(source, source.getPageIndices())
      pages.forEach((page) => merged.addPage(page))
    } catch {
      skipped.push(part.name)
    }
  }

  // Sem object streams: arquivo maior, mas abre em qualquer leitor e impressora
  return {
    bytes: await merged.save({ useObjectStreams: false }),
    skipped,
  }
}

// Os arquivos de um ZIP da API vêm como "1 - Nome.pdf", "2 - Nome.pdf"...:
// ordena pelo número do começo
export function sortZipEntries(files: Record<string, Uint8Array>): pdfPart[] {
  return Object.entries(files)
    .map(([name, bytes]) => ({ name, bytes }))
    .sort(
      (a, b) =>
        (parseInt(a.name, 10) || 0) - (parseInt(b.name, 10) || 0) ||
        a.name.localeCompare(b.name),
    )
}
