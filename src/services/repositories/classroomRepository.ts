import { classroom, segment } from '@/Types'
import { api } from '../api'

export interface classroomRequest {
  id?: string
  location: string
  segment: segment
  startedAt: number
  catechistsId: string[]
}

export class ClassroomRepository {
  static async createNewClassroom(classroom: classroomRequest) {
    const response = await api.post('/classrooms', classroom)
    return response.data
  }

  static async editClassroom(classroom: classroomRequest) {
    const response = await api.put('/classrooms', classroom)
    return response.data
  }

  static async getClassroomNames(): Promise<classroom[]> {
    const response = await api.get('/classrooms')
    return response.data
  }

  static async getClassroom(classroomId: string): Promise<classroom> {
    const response = await api.get(
      `/classrooms/${encodeURIComponent(classroomId)}`,
    )
    return response.data
  }

  static async deleteClassroom(classroomId: string) {
    await api.delete(`/classrooms/${encodeURIComponent(classroomId)}`)
  }
}
