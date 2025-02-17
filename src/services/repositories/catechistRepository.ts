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
      .then(response => {
        return response.data
      })
      .catch(error => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async createNewCatechist(catechist: catechist) {
    return api
      .post(`/catechists`, catechist)
      .then(response => {
        return response.data
      })
      .catch(error => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async updateCatechist(catechist: catechist) {
    return api
      .put(`/catechists/${encodeURIComponent(catechist.id!)}`, catechist)
      .then(response => {
        return response.data
      })
      .catch(error => {
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
      .then(response => {
        return response.data
      })
      .catch(error => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async deleteCatechist(catechistId: string) {
    return api
      .delete(`/catechists/${encodeURIComponent(catechistId)}`)
      .then(response => {
        return response.data
      })
      .catch(error => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async getCatechist(token: string): Promise<catechist> {
    return api
      .get(`/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        return response.data
      })
      .catch(error => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async updatePassword(
    catechistId: string,
    password: string
  ): Promise<catechist> {
    return api
      .patch(`/update-password/${catechistId}`, {
        data: { password },
      })
      .then(response => {
        return response.data
      })
      .catch(error => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ token: string }> {
    const response = api
      .post(`/login`, { email, password })
      .then(response => {
        return response.data
      })
      .catch(error => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
    return response
  }
}
