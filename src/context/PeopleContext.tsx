import { ReactNode, createContext, useEffect, useState } from 'react'
import { catechist, catechizing, classroom } from '../Types'
import { getCatechists, getCatechizings, getClassrooms } from '../services/api'

interface PeopleContextType {
  catechistList: catechist[]
  classroomList: classroom[]
  catechizingList: catechizing[]
  reload: boolean
  onDBUpdate: () => void
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
  const [catechizingList, setCatechizingList] = useState<catechizing[]>([])
  const [reload, setReload] = useState<boolean>(false)

  useEffect(() => {
    async function fetchCatechists() {
      const catechistsResponse = await getCatechists()
      setCatechistList(catechistsResponse)
    }
    async function fetchClassroom() {
      const classroomResponse = await getClassrooms()
      setClassroomList(classroomResponse)
    }
    async function fetchCatechizing() {
      const catechizingResponse = await getCatechizings()
      setCatechizingList(catechizingResponse)
    }
    try {
      fetchCatechists()
      fetchClassroom()
      fetchCatechizing()
    } catch (error) {
      console.log(error)
    }
  }, [reload])

  function onDBUpdate() {
    setReload(!reload)
  }

  return (
    <PeopleContext.Provider
      value={{
        catechistList,
        classroomList,
        catechizingList,
        reload,
        onDBUpdate,
      }}
    >
      {children}
    </PeopleContext.Provider>
  )
}
