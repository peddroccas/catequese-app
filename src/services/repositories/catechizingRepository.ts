import { payment } from '../../Types'
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
        console.error('Erro na requisição:', error)
        throw error // Lançar o erro para que o chamador possa tratá-lo
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
        console.error('Erro na requisição:', error)
        throw error // Lançar o erro para que o chamador possa tratá-lo
      })
  }
}
