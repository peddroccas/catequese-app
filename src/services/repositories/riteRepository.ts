import { rite } from '@/Types'
import { api } from '../api'

export class RiteRepository {
  static async getRites(): Promise<rite[]> {
    const response = await api.get('/rites')
    return response.data
  }

  static async createRite(rite: rite): Promise<rite> {
    const response = await api.post('/rites', rite)
    return response.data
  }

  static async updateRite(rite: rite): Promise<rite> {
    const response = await api.put('/rites', rite)
    return response.data
  }

  static async deleteRite(riteId: string) {
    await api.delete(`/rites/${encodeURIComponent(riteId)}`)
  }

  // Anexa mais um PDF ao rito
  static async uploadFile(riteId: string, file: File): Promise<rite> {
    const form = new FormData()
    form.append('file', file, file.name)
    // Content-Type undefined deixa o axios montar o multipart com o boundary
    const response = await api.post(
      `/rites/${encodeURIComponent(riteId)}/files`,
      form,
      { headers: { 'Content-Type': undefined } },
    )
    return response.data
  }

  static async removeFile(riteId: string, fileId: string) {
    await api.delete(
      `/rites/${encodeURIComponent(riteId)}/files/${encodeURIComponent(fileId)}`,
    )
  }
}
