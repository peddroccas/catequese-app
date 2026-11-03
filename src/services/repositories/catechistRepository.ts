import { catechist } from '@/Types'
import { api } from '../api'

export class CatechistRepository {
  static async getAllCatechists(): Promise<catechist[]> {
    const response = await api.get('/catechists')
    return response.data
  }

  static async createNewCatechist(catechist: catechist): Promise<catechist> {
    const response = await api.post('/catechists', catechist)
    return response.data
  }

  static async updateCatechist(catechist: catechist) {
    await api.put('/catechists', catechist)
  }

  static async getArchivedCatechists(): Promise<catechist[]> {
    const response = await api.get('/catechists/archived')
    return response.data
  }

  static async archiveCatechist(catechistId: string) {
    await api.patch(`/catechists/${encodeURIComponent(catechistId)}/archive`)
  }

  static async restoreCatechist(catechistId: string) {
    await api.patch(`/catechists/${encodeURIComponent(catechistId)}/restore`)
  }

  static async deleteCatechist(catechistId: string) {
    await api.delete(`/catechists/${encodeURIComponent(catechistId)}`)
  }

  static async resetPassword(catechistId: string) {
    await api.patch(
      `/catechists/${encodeURIComponent(catechistId)}/password/reset`,
    )
  }

  static async changeOwnPassword(password: string) {
    await api.patch('/catechists/me/password', { password })
  }

  static async getProfile(): Promise<catechist> {
    const response = await api.get('/catechists/me')
    return response.data
  }

  static async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; mustChangePassword: boolean }> {
    const response = await api.post('/catechists/auth', { email, password })
    return response.data
  }
}
