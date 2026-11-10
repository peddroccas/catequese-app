import { parish, parishChanges, publicParish } from '@/Types'
import { api, publicApi } from '../api'

export class ParishRepository {
  // A paróquia de quem está logado
  static async getCurrent(): Promise<parish> {
    const response = await api.get('/parish')
    return response.data
  }

  // Só a coordenação. Troca todos os campos editáveis de uma vez
  static async update(changes: parishChanges): Promise<parish> {
    const response = await api.put('/parish', changes)
    return response.data
  }

  // A paróquia dona de um endereço (domínio próprio ou subdomínio); 404 se nenhuma
  static async resolveHost(host: string): Promise<publicParish> {
    const response = await publicApi.get('/public/parishes/resolve', {
      params: { host },
    })
    return response.data
  }

  // Dados públicos, sem login (página de inscrição)
  static async getPublic(slug: string): Promise<publicParish> {
    const response = await publicApi.get(
      `/public/parishes/${encodeURIComponent(slug)}`,
    )
    return response.data
  }
}
