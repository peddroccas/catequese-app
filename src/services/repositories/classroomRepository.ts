import { api } from '../api'

export type segment =
  | '1° Eucaristia'
  | 'Crisma'
  | 'Catequizandos Adultos'
  | 'Catecúmenos Adultos'
  | 'Sementinha'
  | 'Pré-eucaristia'

export class ClassroomRepository {
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

  static async getClassroomNames(): Promise<string[]> {
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
}
