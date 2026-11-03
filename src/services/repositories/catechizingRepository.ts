import { catechizing } from '../../Types'
import { api } from '../api'

export class CatechizingRepository {
  static async getAllCatechizings(): Promise<catechizing[]> {
    const response = await api.get('/catechizings')
    return response.data
  }

  static async createNewCatechizing(data: catechizing): Promise<catechizing> {
    const response = await api.post('/catechizings', data)
    return response.data
  }

  static async updateCatechizing(data: catechizing): Promise<catechizing> {
    const response = await api.put('/catechizings', data)
    return response.data
  }

  static async getArchivedCatechizings(): Promise<catechizing[]> {
    const response = await api.get('/catechizings/archived')
    return response.data
  }

  static async archiveCatechizing(catechizingId: string) {
    await api.patch(
      `/catechizings/${encodeURIComponent(catechizingId)}/archive`,
    )
  }

  static async restoreCatechizing(catechizingId: string, classroomId?: string) {
    await api.patch(
      `/catechizings/${encodeURIComponent(catechizingId)}/restore`,
      { classroomId },
    )
  }

  static async deleteCatechizing(catechizingId: string) {
    await api.delete(`/catechizings/${encodeURIComponent(catechizingId)}`)
  }

  static async transferCatechizing(catechizingId: string, classroomId: string) {
    const response = await api.patch('/catechizings/transfer', {
      id: catechizingId,
      classroomId,
    })
    return response.data
  }
}
