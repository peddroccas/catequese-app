import {
  catechizing,
  catechizingGroup,
  catechizingsPage,
  catechizingSortColumn,
  sortDirection,
} from '../../Types'
import { api } from '../api'

export interface ImportRowResult {
  // Posição na lista enviada, a partir de 1
  row: number
  ok: boolean
  error?: string
}

export interface ImportResult {
  total: number
  imported: number
  failed: number
  results: ImportRowResult[]
}

export class CatechizingRepository {
  // Cadastro em lote (planilha): cada linha entra ou volta com o motivo
  static async importMany(
    rows: unknown[],
    defaultClassroomId?: string,
  ): Promise<ImportResult> {
    const response = await api.post('/catechizings/import', {
      rows,
      defaultClassroomId,
    })
    return response.data
  }

  static async getAllCatechizings(): Promise<catechizing[]> {
    const response = await api.get('/catechizings')
    return response.data
  }

  // Uma página de catequizandos, com busca, grupo e ordenação feitos no servidor.
  // O signal cancela a chamada anterior quando o filtro muda antes dela voltar
  static async getPage(
    params: {
      page: number
      pageSize: number
      search?: string
      group?: catechizingGroup
      sortBy?: catechizingSortColumn
      sortDirection?: sortDirection
    },
    signal?: AbortSignal,
  ): Promise<catechizingsPage> {
    const response = await api.get('/catechizings/search', {
      params: { ...params, search: params.search || undefined },
      signal,
    })
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
