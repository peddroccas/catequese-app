import { getLocalTimeZone } from '@internationalized/date'
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
      .post('/catechizings/new', {
        ...data,
        birthday: data.birthday,
        parents: { name: '', phone: '', kinship: '' },
      })
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
      .put('/catechizings', {
        ...data,
        birthday: data.birthday,
      })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro na requisição:', error)
        throw error
      })
  }

  static async transferClassCatechizing(data: catechizing) {
    return api
      .patch('/catechizings/transfer', {
        ...data,
        birthday: data.birthday,
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
