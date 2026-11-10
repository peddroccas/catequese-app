import { catechist } from '@/Types'
import { api } from '../api'

export class CatechistRepository {
  static async getAllCatechists(): Promise<catechist[]> {
    const response = await api.get('/catechists')
    return response.data
  }

  // A resposta traz a senha temporária, mostrada só nesta vez
  static async createNewCatechist(
    catechist: catechist,
  ): Promise<catechist & { temporaryPassword: string }> {
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

  static async resetPassword(
    catechistId: string,
  ): Promise<{ temporaryPassword: string }> {
    const response = await api.patch(
      `/catechists/${encodeURIComponent(catechistId)}/password/reset`,
    )
    return response.data
  }

  static async changeOwnPassword(password: string) {
    await api.patch('/catechists/me/password', { password })
  }

  static async changeOwnAvatar(image: Blob): Promise<{ avatarUrl: string }> {
    const form = new FormData()
    form.append('file', image, 'avatar.jpg')
    // Content-Type undefined deixa o axios montar o multipart com o boundary
    const response = await api.patch('/catechists/me/avatar', form, {
      headers: { 'Content-Type': undefined },
    })
    return response.data
  }

  static async removeOwnAvatar() {
    await api.delete('/catechists/me/avatar')
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

  // A resposta é a mesma exista ou não a conta (não revela quem tem cadastro)
  static async requestPasswordReset(email: string) {
    await api.post('/catechists/forgot-password', { email })
  }

  static async resetPasswordWithToken(token: string, password: string) {
    await api.post('/catechists/reset-password', { token, password })
  }
}
