import { adminParish, createAdminParish } from '@/Types'
import { ADMIN_TOKEN_KEY, adminApi } from '../adminApi'

export class AdminRepository {
  static hasToken() {
    return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY))
  }

  static async login(email: string, password: string) {
    const response = await adminApi.post('/admin/auth', { email, password })
    localStorage.setItem(ADMIN_TOKEN_KEY, response.data.accessToken)
  }

  static logout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  }

  static async me(): Promise<{ id: string; name: string; email: string }> {
    const response = await adminApi.get('/admin/me')
    return response.data
  }

  static async list(): Promise<adminParish[]> {
    const response = await adminApi.get('/admin/parishes')
    return response.data
  }

  // Devolve a senha temporária do coordenador (aparece só desta vez)
  static async create(data: createAdminParish): Promise<{
    parishId: string
    slug: string
    coordinatorEmail: string
    temporaryPassword: string
  }> {
    const response = await adminApi.post('/admin/parishes', data)
    return response.data
  }

  static async update(
    id: string,
    changes: {
      status?: 'ACTIVE' | 'SUSPENDED'
      plan?: string
      paidUntil?: string | null
      customDomain?: string | null
    },
  ) {
    await adminApi.patch(`/admin/parishes/${encodeURIComponent(id)}`, changes)
  }

  static async resetCoordinator(
    id: string,
    email: string,
  ): Promise<{ email: string; temporaryPassword: string }> {
    const response = await adminApi.post(
      `/admin/parishes/${encodeURIComponent(id)}/reset-coordinator`,
      { email },
    )
    return response.data
  }

  static async exportData(id: string): Promise<Blob> {
    const response = await adminApi.get(
      `/admin/parishes/${encodeURIComponent(id)}/export`,
      { responseType: 'blob' },
    )
    return response.data
  }

  // Apaga TUDO da paróquia, para sempre
  static async remove(id: string, confirmSlug: string) {
    await adminApi.delete(`/admin/parishes/${encodeURIComponent(id)}`, {
      data: { confirmSlug },
    })
  }
}
