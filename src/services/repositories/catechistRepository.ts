import { catechist } from '@/Types'
import { api } from '../api'
import { getLocalTimeZone } from '@internationalized/date'

export type segment =
  | '1° Eucaristia'
  | 'Crisma'
  | 'Catequizandos Adultos'
  | 'Catecúmenos Adultos'
  | 'Sementinha'
  | 'Pré-eucaristia'

export class CatechistRepository {
  static async getAllCatechists(): Promise<catechist[]> {
    return api
      .get(`/catechists`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async createNewCatechist(catechist: catechist) {
    return api
      .post(`/catechists`, {
        ...catechist,
        birthday: catechist.birthday?.toDate(getLocalTimeZone()),
      })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }
}
