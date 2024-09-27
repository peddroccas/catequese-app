import { catechizing, payment } from '../../Types'
import { api } from '../api'

export class CatechizingRepository {
  static async getPaymentsByCatechizing(
    catechizingName: string,
  ): Promise<payment> {
    return api
      .get(`/payments/${encodeURIComponent(catechizingName)}`) // Incluindo o parâmetro na URL
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro ao consultar parcelas:', error)
        throw error
      })
  }

  static async getAllCatechizings(): Promise<catechizing[]> {
    return api
      .get('/catechizings') // Incluindo o parâmetro na URL
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro ao consultar parcelas:', error)
        throw error
      })
  }

  static async addNewInstallment(
    catechizingName: string,
    data: { payedAt: Date; value: number },
  ) {
    return api
      .post(`/payments/${encodeURIComponent(catechizingName)}`, data) // Incluindo o parâmetro na URL
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro ao adicionar nova parcela:', error)
        throw error
      })
  }

  static async createNewCatechizing(data: catechizing) {
    return api
      .post('/catechizings/new', data)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro na requisição:', error)
        throw error
      })
  }

  static async deleteCatechizing(catechizingId: string) {
    return api
      .delete(`/catechizings/${catechizingId}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro na requisição:', error)
        throw error
      })
  }

  static async updateCatechizing(data: catechizing) {
    return api
      .put('/catechizings', data)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro na requisição:', error)
        throw error
      })
  }

  static async transferCatechizing(catechizingId: string, classroomId: string) {
    return api
      .patch('/catechizings/transfer', {
        id: catechizingId,
        classroomId,
      })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro na requisição:', error)
        throw error
      })
  }
}
