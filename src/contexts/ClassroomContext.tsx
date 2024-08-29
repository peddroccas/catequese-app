import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { ReactNode, createContext, useEffect, useState } from 'react'

interface ClassroomType {
  hasClassroomUpdate: boolean
  throwClassroomUpdate: () => void
  throwClassroomHasAlreadyUpdated: () => void
  classrooms: {
    id: string
    classroomName: string
  }[]
}
export const ClassroomContext = createContext({} as ClassroomType)

interface ClassroomProviderProps {
  children: ReactNode
}

export function ClassroomProvider({ children }: ClassroomProviderProps) {
  const [hasClassroomUpdate, sethasClassroomUpdate] = useState<boolean>(false)
  const [classrooms, setClassrooms] = useState<
    {
      id: string
      classroomName: string
    }[]
  >([])

  // Consulta nome das turmas
  useEffect(() => {
    async function getClassroomNames() {
      const classroomNamesResponse =
        await ClassroomRepository.getClassroomNames()
      setClassrooms(classroomNamesResponse)
    }

    getClassroomNames()
  }, [])

  function throwClassroomUpdate() {
    sethasClassroomUpdate(true)
  }

  function throwClassroomHasAlreadyUpdated() {
    sethasClassroomUpdate(false)
  }
  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        hasClassroomUpdate,
        throwClassroomUpdate,
        throwClassroomHasAlreadyUpdated,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  )
}
