import { ReactNode, createContext, useState } from 'react'

interface DataType {
  hasDbUpdate: boolean
  throwDataUpdate: () => void
  throwDataHasAlreadyUpdated: () => void
}
export const DataContext = createContext({} as DataType)

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const [hasDbUpdate, setHasDbUpdate] = useState<boolean>(true)

  function throwDataUpdate() {
    setHasDbUpdate(true)
  }

  function throwDataHasAlreadyUpdated() {
    setHasDbUpdate(false)
  }
  return (
    <DataContext.Provider
      value={{
        hasDbUpdate,
        throwDataUpdate,
        throwDataHasAlreadyUpdated,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
