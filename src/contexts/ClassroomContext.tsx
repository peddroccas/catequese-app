import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { catechist } from '@/Types'
import { ReactNode, createContext, useEffect, useState } from 'react'

interface ClassroomType {
  hasClassroomUpdate: boolean
  hasCatechistUpdate: boolean
  catechists: catechist[]
  classrooms: {
    id: string
    classroomName: string
    startedAt: number
  }[]
  throwClassroomUpdate: () => void
  throwClassroomHasAlreadyUpdated: () => void
  throwCatechistUpdate: () => void
  throwCatechistHasAlreadyUpdated: () => void
}
export const ClassroomContext = createContext({} as ClassroomType)

interface ClassroomProviderProps {
  children: ReactNode
}

export function ClassroomProvider({ children }: ClassroomProviderProps) {
  const [hasClassroomUpdate, setHasClassroomUpdate] = useState<boolean>(true)
  const [hasCatechistUpdate, setHasCatechistUpdate] = useState<boolean>(true)
  const [classrooms, setClassrooms] = useState<
    {
      id: string
      classroomName: string
      startedAt: number
    }[]
  >([])
  const [catechists, setCatechists] = useState<catechist[]>([])

  // Consulta nome das turmas
  useEffect(() => {
    async function getClassroomNames() {
      if (hasClassroomUpdate) {
        const classroomNamesResponse =
          await ClassroomRepository.getClassroomNames()
        setClassrooms(classroomNamesResponse)
      }
    }

    getClassroomNames().finally(throwClassroomHasAlreadyUpdated)
  }, [hasClassroomUpdate])

  useEffect(() => {
    async function getCatechists() {
      if (hasCatechistUpdate) {
        const catechists = await CatechistRepository.getCatechists()
        setCatechists(catechists)
      }
    }
    getCatechists().finally(throwCatechistHasAlreadyUpdated)
  }, [hasCatechistUpdate])

  function throwClassroomUpdate() {
    setHasClassroomUpdate(true)
  }

  function throwClassroomHasAlreadyUpdated() {
    setHasClassroomUpdate(false)
  }

  function throwCatechistUpdate() {
    setHasCatechistUpdate(true)
  }

  function throwCatechistHasAlreadyUpdated() {
    setHasCatechistUpdate(false)
  }
  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        catechists,
        hasClassroomUpdate,
        hasCatechistUpdate,
        throwClassroomUpdate,
        throwClassroomHasAlreadyUpdated,
        throwCatechistUpdate,
        throwCatechistHasAlreadyUpdated,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  )
}
