import { formation } from '@/Types'
import { api } from '../api'

export class FormationRepository {
  static async getAllFormations(): Promise<formation[]> {
    const response = await api.get('/formations')
    return response.data
  }

  static async createNewFormation(formation: formation): Promise<formation> {
    const response = await api.post('/formations', formation)
    return response.data
  }

  static async updateFormation(formation: formation): Promise<formation> {
    const response = await api.put('/formations', formation)
    return response.data
  }

  static async deleteFormation(formationId: string) {
    await api.delete(`/formations/${encodeURIComponent(formationId)}`)
  }
}
