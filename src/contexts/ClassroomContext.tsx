import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { catechist, catechizing, classroom } from '@/Types'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AuthContext } from './AuthContext'

interface ClassroomType {
  hasClassroomUpdate: boolean
  hasCatechistUpdate: boolean
  hasCatechizingUpdate: boolean
  catechizings: catechizing[]
  catechists: catechist[]
  classrooms: classroom[]
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
  const { user } = useContext(AuthContext)
  const [hasClassroomUpdate, setHasClassroomUpdate] = useState<boolean>(true)
  const [hasCatechistUpdate, setHasCatechistUpdate] = useState<boolean>(true)
  const [hasCatechizingUpdate, setHasCatechizingUpdate] =
    useState<boolean>(true)
  const [catechizings, setCatechizings] = useState<catechizing[]>([])
  const [classrooms, setClassrooms] = useState<classroom[]>([])
  const [catechists, setCatechists] = useState<catechist[]>([])

  // Consulta nome das turmas
  useEffect(() => {
    async function getClassroomNames() {
      if (hasClassroomUpdate || user) {
        const classroomNamesResponse =
          await ClassroomRepository.getClassroomNames()
        setClassrooms(classroomNamesResponse)
        return true
      }
      return false
    }

    if (user) {
      getClassroomNames().then((response) => {
        if (response) {
          throwClassroomHasAlreadyUpdated()
        }
      })
    }
  }, [hasClassroomUpdate, user])

  // Consulta todos os catequistas
  useEffect(() => {
    async function getCatechists() {
      if ((hasCatechistUpdate && hasClassroomUpdate) || user) {
        const catechists = await CatechistRepository.getAllCatechists()
        setCatechists(catechists)
      }
    }
    if (user) {
      getCatechists().finally(() => {
        throwCatechistHasAlreadyUpdated()
        throwClassroomHasAlreadyUpdated()
      })
    }
  }, [hasCatechistUpdate, hasClassroomUpdate, user])

  // Consulta todos os catequizandos
  useEffect(() => {
    async function getCatechizings() {
      if ((hasCatechizingUpdate && hasClassroomUpdate) || user) {
        const catechizings = await CatechizingRepository.getAllCatechizings()
        setCatechizings(catechizings)
      }
    }

    if (user) {
      getCatechizings().finally(() => {
        throwCatechizingHasAlreadyUpdated()
        throwClassroomHasAlreadyUpdated()
      })
    }
  }, [hasCatechizingUpdate, hasClassroomUpdate, user])

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
