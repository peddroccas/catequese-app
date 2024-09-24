import { classroom } from '@/Types'
import { api } from '../api'

export type segment =
  | '1° Eucaristia'
  | 'Crisma'
  | 'Catequizandos Adultos'
  | 'Catecúmenos Adultos'
  | 'Sementinha'
  | 'Pré-eucaristia'

export class ClassroomRepository {
  static async createNewClassroom(classroom: classroom) {
    return api
      .post('/classrooms', classroom)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro na requisição:', error)
      })
  }

  static async editClassroom(classroom: classroom) {
    return api
      .put('/classrooms', classroom)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Erro na requisição:', error)
      })
  }

  static async getClassroomNamesBySegment(
    segment: string,
  ): Promise<{ id: string; classroomName: string }[]> {
    return api
      .get(`/classrooms/names/${encodeURIComponent(segment)}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async getClassroomNames(): Promise<
    {
      id: string
      classroomName: string
      startedAt: number
    }[]
  > {
    return api
      .get(`/classrooms/names`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async getCatechizingByClassroom(classroomName: string): Promise<
    {
      id: string
      name: string
    }[]
  > {
    return api
      .get(`/catechizings/${encodeURIComponent(classroomName)}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async getClassroom(classroomId: string): Promise<classroom> {
    return api
      .get(`/classrooms/${encodeURIComponent(classroomId)}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async deleteClassroom(classroomId: string): Promise<classroom> {
    return api
      .delete(`/classrooms/${classroomId}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }
}
