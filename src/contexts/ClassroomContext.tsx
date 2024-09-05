import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { catechist, catechizing } from '@/Types'
import { ReactNode, createContext, useEffect, useState } from 'react'

interface ClassroomType {
  hasClassroomUpdate: boolean
  hasCatechistUpdate: boolean
  hasCatechizingUpdate: boolean
  catechizings: catechizing[]
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
  throwCatechizingUpdate: () => void
  throwCatechizingHasAlreadyUpdated: () => void
}
export const ClassroomContext = createContext({} as ClassroomType)

interface ClassroomProviderProps {
  children: ReactNode
}

export function ClassroomProvider({ children }: ClassroomProviderProps) {
  const [hasClassroomUpdate, setHasClassroomUpdate] = useState<boolean>(true)
  const [hasCatechistUpdate, setHasCatechistUpdate] = useState<boolean>(true)
  const [hasCatechizingUpdate, setHasCatechizingUpdate] =
    useState<boolean>(true)
  const [catechizings, setCatechizings] = useState<catechizing[]>([])
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

  // Consulta todos os catequistas
  useEffect(() => {
    async function getCatechists() {
      if (hasCatechistUpdate) {
        const catechists = await CatechistRepository.getAllCatechists()
        setCatechists(catechists)
      }
    }
    getCatechists().finally(throwCatechistHasAlreadyUpdated)
  }, [hasCatechistUpdate])

  // Consulta todos os catequizandos
  useEffect(() => {
    async function getCatechizings() {
      if (hasCatechizingUpdate) {
        const catechizings = await CatechizingRepository.getAllCatechizings()
        setCatechizings(catechizings)
      }
    }

    getCatechizings().finally(throwClassroomHasAlreadyUpdated)
  }, [hasCatechizingUpdate])

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

  function throwCatechizingUpdate() {
    setHasCatechizingUpdate(true)
  }

  function throwCatechizingHasAlreadyUpdated() {
    setHasCatechizingUpdate(false)
  }
  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        catechists,
        catechizings,
        hasClassroomUpdate,
        hasCatechistUpdate,
        hasCatechizingUpdate,
        throwClassroomUpdate,
        throwClassroomHasAlreadyUpdated,
        throwCatechistUpdate,
        throwCatechistHasAlreadyUpdated,
        throwCatechizingUpdate,
        throwCatechizingHasAlreadyUpdated,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  )
}
