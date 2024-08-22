import { api } from '../api'

export type segment =
  | '1° Eucaristia'
  | 'Crisma'
  | 'Catequizandos Adultos'
  | 'Catecúmenos Adultos'
  | 'Sementinha'
  | 'Pré-eucaristia'

export class ClassroomRepository {
  static async getClassroomNames(segment: string): Promise<string[]> {
    return api
      .get(`/classrooms/names/${encodeURI(segment)}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }

  static async getCatechizingByClassroom(
    classroomName: string,
  ): Promise<string[]> {
    return api
      .get(`/catechizings/${classroomName}`)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        // Manipular erros na requisição
        console.error('Erro na requisição:', error)
      })
  }
}
