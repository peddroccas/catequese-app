import { catechist } from '@/Types'
import { api } from '../api'

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
      .post(`/catechists`, catechist)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async updateCatechist(catechist: catechist) {
    return api
      .put(`/catechists/${encodeURIComponent(catechist.id!)}`, catechist)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async transferCatechist(catechistId: string, classroomId: string) {
    return api
      .patch(`/catechists/transfer`, {
        id: catechistId,
        classroomId,
      })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async deleteCatechist(catechistId: string) {
    return api
      .delete(`/catechists/${encodeURIComponent(catechistId)}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async getCatechist(catechistId: string) {
    return api
      .get(`/catechists/${encodeURIComponent(catechistId)}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async signIn(email: string, password: string): Promise<catechist> {
    const response = api
      .post(`/signIn`, { email, password })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
    return response
  }

  static async signUp(email: string, password: string) {
    return api
      .patch(`/signUp`, { email, password })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }
}
