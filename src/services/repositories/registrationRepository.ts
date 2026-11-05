import {
  catechizing,
  registration,
  registrationSettings,
  registrationStatus,
} from '@/Types'
import { api, publicApi } from '../api'

export class RegistrationRepository {
  // --- Público (sem login)

  // Aberto e quais etapas recebem inscrição (fechado = nenhuma etapa)
  static async getPublicStatus(): Promise<registrationSettings> {
    const response = await publicApi.get('/public/registrations/status')
    return response.data
  }

  // Dados da ficha em JSON + um arquivo por documento (campo = nome do documento)
  static async submit(
    data: Record<string, unknown>,
    files: Record<string, File | Blob>,
    fileNames: Record<string, string>,
  ): Promise<{ protocol: string }> {
    const form = new FormData()
    form.append('data', JSON.stringify(data))
    for (const [field, file] of Object.entries(files)) {
      form.append(field, file, fileNames[field])
    }
    // Content-Type undefined deixa o axios montar o multipart com o boundary
    const response = await publicApi.post('/public/registrations', form, {
      headers: { 'Content-Type': undefined },
      timeout: 120_000,
    })
    return response.data
  }

  // --- Coordenação

  static async getAll(status?: registrationStatus): Promise<registration[]> {
    const response = await api.get('/registrations', { params: { status } })
    return response.data
  }

  static async getSettings(): Promise<registrationSettings> {
    const response = await api.get('/registrations/settings')
    return response.data
  }

  // Muda só o que for enviado (abrir/fechar tudo e/ou as etapas)
  static async updateSettings(
    changes: Partial<registrationSettings>,
  ): Promise<registrationSettings> {
    const response = await api.put('/registrations/settings', changes)
    return response.data
  }

  // Inscrição de onde o catequizando veio (404 se foi cadastrado à mão)
  static async getByCatechizing(
    catechizingId: string,
  ): Promise<registration | null> {
    try {
      const response = await api.get(
        `/registrations/by-catechizing/${encodeURIComponent(catechizingId)}`,
      )
      return response.data
    } catch {
      return null
    }
  }

  // Link temporário: o bucket dos documentos é privado
  static async getDocumentUrl(
    registrationId: string,
    fileId: string,
  ): Promise<string> {
    const response = await api.get(
      `/registrations/${encodeURIComponent(registrationId)}/files/${encodeURIComponent(fileId)}/url`,
    )
    return response.data.url
  }

  static async downloadZip(registrationId: string): Promise<Blob> {
    const response = await api.get(
      `/registrations/${encodeURIComponent(registrationId)}/documents.zip`,
      { responseType: 'blob' },
    )
    return response.data
  }

  static async approve(
    registrationId: string,
    classroomId: string,
  ): Promise<catechizing> {
    const response = await api.post(
      `/registrations/${encodeURIComponent(registrationId)}/approve`,
      { classroomId },
    )
    return response.data
  }

  static async reject(registrationId: string, reason: string) {
    await api.post(
      `/registrations/${encodeURIComponent(registrationId)}/reject`,
      { reason },
    )
  }
}
