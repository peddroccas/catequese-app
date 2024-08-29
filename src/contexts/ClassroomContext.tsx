import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { ReactNode, createContext, useEffect, useState } from 'react'

interface ClassroomType {
  hasClassroomUpdate: boolean
  throwClassroomUpdate: () => void
  throwClassroomHasAlreadyUpdated: () => void
  classroomNames: string[]
}
export const ClassroomContext = createContext({} as ClassroomType)

interface ClassroomProviderProps {
  children: ReactNode
}

export function ClassroomProvider({ children }: ClassroomProviderProps) {
  const [hasClassroomUpdate, sethasClassroomUpdate] = useState<boolean>(false)
  const [classroomNames, setClassroomNames] = useState<string[]>([])

  // Consulta nome das turmas
  useEffect(() => {
    async function getClassroomNames() {
      if (hasClassroomUpdate) {
        const classroomNamesResponse =
          await ClassroomRepository.getClassroomNames()
        setClassroomNames(classroomNamesResponse)
      }
    }
    getClassroomNames()
  }, [hasClassroomUpdate])

  function throwClassroomUpdate() {
    sethasClassroomUpdate(true)
  }

  function throwClassroomHasAlreadyUpdated() {
    sethasClassroomUpdate(false)
  }
  return (
    <ClassroomContext.Provider
      value={{
        classroomNames,
        hasClassroomUpdate,
        throwClassroomUpdate,
        throwClassroomHasAlreadyUpdated,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  )
}
