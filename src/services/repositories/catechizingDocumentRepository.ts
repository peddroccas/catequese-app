import { catechizingDocument, documentKind } from '@/Types'
import { api } from '../api'

// Documentos do catequizando: só a coordenação acessa (a API também confere)
export class CatechizingDocumentRepository {
  static async getAll(catechizingId: string): Promise<catechizingDocument[]> {
    const response = await api.get(
      `/catechizings/${encodeURIComponent(catechizingId)}/documents`,
    )
    return response.data
  }

  // Cadastra o documento ou, se o tipo já existe, troca o arquivo
  static async upload(
    catechizingId: string,
    kind: documentKind,
    file: File,
  ): Promise<catechizingDocument> {
    const form = new FormData()
    form.append('kind', kind)
    form.append('file', file, file.name)
    // Content-Type undefined deixa o axios montar o multipart com o boundary
    const response = await api.post(
      `/catechizings/${encodeURIComponent(catechizingId)}/documents`,
      form,
      { headers: { 'Content-Type': undefined }, timeout: 120_000 },
    )
    return response.data
  }

  static async remove(catechizingId: string, documentId: string) {
    await api.delete(
      `/catechizings/${encodeURIComponent(catechizingId)}/documents/${encodeURIComponent(documentId)}`,
    )
  }

  // Link temporário: o bucket dos documentos é privado
  static async getUrl(
    catechizingId: string,
    documentId: string,
  ): Promise<string> {
    const response = await api.get(
      `/catechizings/${encodeURIComponent(catechizingId)}/documents/${encodeURIComponent(documentId)}/url`,
    )
    return response.data.url
  }

  static async downloadZip(catechizingId: string): Promise<Blob> {
    const response = await api.get(
      `/catechizings/${encodeURIComponent(catechizingId)}/documents-zip`,
      { responseType: 'blob' },
    )
    return response.data
  }
}
