import { catechistInitialState } from '@/reducer/catechist/catechistReducer'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist } from '@/Types'
import { ReactNode, createContext, useEffect, useState } from 'react'

export interface AuthType {
  user: catechist
  login: (email: string, password: string) => Promise<catechist>
  logout: () => void
  isCheckingLocalStorage: boolean
  throwUserUpdate: () => void
}
export const AuthContext = createContext({} as AuthType)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<catechist>(catechistInitialState)
  const [isCheckingLocalStorage, setIsCheckingLocalStorage] =
    useState<boolean>(true)
  const [hasUserUpdate, setHasUserUpdate] = useState<boolean>(false)

  useEffect(() => {
    async function getCatechist() {
      const token = localStorage.getItem('auth')
      if (token) {
        const catechist = await CatechistRepository.getCatechist(token)
        setUser(catechist)
      }
    }
    getCatechist().finally(() => setIsCheckingLocalStorage(false))
  }, [])

  async function throwUserUpdate() {
    setHasUserUpdate(true)
  }

  async function login(email: string, password: string): Promise<catechist> {
    const { token } = await CatechistRepository.login(email, password)
    if (token) {
      localStorage.setItem('auth', token)
      const catechist = await CatechistRepository.getCatechist(token)
      setUser(catechist)
      return catechist
    }
    return {} as catechist
  }

  async function logout() {
    setUser({} as catechist)
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isCheckingLocalStorage, throwUserUpdate }}
    >
      {children}
    </AuthContext.Provider>
  )
}
