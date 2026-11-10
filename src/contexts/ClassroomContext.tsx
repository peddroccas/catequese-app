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
  catechizings: catechizing[]
  catechists: catechist[]
  classrooms: classroom[]
  throwClassroomUpdate: () => void
  throwCatechistUpdate: () => void
  throwCatechizingUpdate: () => void
  // Sobe a cada alteração de catequizandos; listas paginadas recarregam por ele
  catechizingsVersion: number
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
  const [catechizingsVersion, setCatechizingsVersion] = useState<number>(0)

  // Recarrega tudo sempre que alguém faz login
  useEffect(() => {
    if (user?.id) {
      setHasClassroomUpdate(true)
      setHasCatechistUpdate(true)
      setHasCatechizingUpdate(true)
    }
  }, [user?.id])

  // Consulta as turmas
  useEffect(() => {
    if (user && hasClassroomUpdate) {
      ClassroomRepository.getClassroomNames()
        .then(setClassrooms)
        .catch(console.error)
        .finally(() => setHasClassroomUpdate(false))
    }
  }, [hasClassroomUpdate, user])

  // Consulta todos os catequistas
  useEffect(() => {
    if (user && hasCatechistUpdate) {
      CatechistRepository.getAllCatechists()
        .then(setCatechists)
        .catch(console.error)
        .finally(() => setHasCatechistUpdate(false))
    }
  }, [hasCatechistUpdate, user])

  // Consulta todos os catequizandos
  useEffect(() => {
    if (user && hasCatechizingUpdate) {
      CatechizingRepository.getAllCatechizings()
        .then(setCatechizings)
        .catch(console.error)
        .finally(() => setHasCatechizingUpdate(false))
    }
  }, [hasCatechizingUpdate, user])

  function throwClassroomUpdate() {
    setHasClassroomUpdate(true)
  }

  function throwCatechistUpdate() {
    setHasCatechistUpdate(true)
  }

  function throwCatechizingUpdate() {
    setHasCatechizingUpdate(true)
    setCatechizingsVersion((version) => version + 1)
  }

  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        catechists,
        catechizings,
        throwClassroomUpdate,
        throwCatechistUpdate,
        throwCatechizingUpdate,
        catechizingsVersion,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  )
}
