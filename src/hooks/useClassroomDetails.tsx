import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { classroom } from '@/Types'
import { useContext, useEffect, useState } from 'react'

// Busca a turma com os catequizandos e recarrega quando turmas ou
// catequizandos mudam (cadastro, edição, transferência...)
export function useClassroomDetails(classroomId?: string) {
  const { classrooms, catechizings } = useContext(ClassroomContext)
  const [classroom, setClassroom] = useState<classroom | null>(null)

  useEffect(() => {
    if (!classroomId) {
      setClassroom(null)
      return
    }
    let isCurrent = true
    ClassroomRepository.getClassroom(classroomId)
      .then((response) => isCurrent && setClassroom(response))
      .catch(() => isCurrent && setClassroom(null))
    return () => {
      isCurrent = false
    }
  }, [classroomId, classrooms, catechizings])

  return classroom
}
