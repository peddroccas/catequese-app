import { ReactNode, createContext, useState } from 'react'

interface InstallmentType {
  hasInstallmentUpdate: boolean
  throwInstallmentUpdate: () => void
  throwInstallmentHasAlreadyUpdated: () => void
}
export const InstallmentContext = createContext({} as InstallmentType)

interface InstallmentProviderProps {
  children: ReactNode
}

export function InstallmentProvider({ children }: InstallmentProviderProps) {
  const [hasInstallmentUpdate, sethasInstallmentUpdate] =
    useState<boolean>(false)

  function throwInstallmentUpdate() {
    sethasInstallmentUpdate(true)
  }

  function throwInstallmentHasAlreadyUpdated() {
    sethasInstallmentUpdate(false)
  }
  return (
    <InstallmentContext.Provider
      value={{
        hasInstallmentUpdate,
        throwInstallmentUpdate,
        throwInstallmentHasAlreadyUpdated,
      }}
    >
      {children}
    </InstallmentContext.Provider>
  )
}
