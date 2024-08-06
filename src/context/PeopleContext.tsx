import { ReactNode, createContext, useEffect, useState } from 'react'
import { catechist, classroom } from '../Types'
import { getCatechists, getClassrooms } from '../services/api'

interface PeopleContextType {
  catechistList: catechist[]
  classroomList: classroom[]
}
export const PeopleContext = createContext({} as PeopleContextType)

interface PeopleContextProviderProps {
  children: ReactNode
}

export function PeopleContextProvider({
  children,
}: PeopleContextProviderProps) {
  const [catechistList, setCatechistList] = useState<catechist[]>([])
  const [classroomList, setClassroomList] = useState<classroom[]>([])

  useEffect(() => {
    async function fetchCatechists() {
      const catechistsResponse = await getCatechists()
      setCatechistList(catechistsResponse)
    }
    async function fetchClassroom() {
      const classroomResponse = await getClassrooms()
      setClassroomList(classroomResponse)
    }
    fetchCatechists()
    fetchClassroom()
  }, [])

  return (
    <PeopleContext.Provider value={{ catechistList, classroomList }}>
      {children}
    </PeopleContext.Provider>
  )
}
