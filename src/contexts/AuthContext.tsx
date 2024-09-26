import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist } from '@/Types'
import { ReactNode, createContext, useEffect, useState } from 'react'

export interface AuthType {
  user: catechist | null
  login: (email: string, password: string) => Promise<catechist>
  logout: () => void
  isCheckingLocalStorage: boolean
}
export const AuthContext = createContext({} as AuthType)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<catechist | null>(null)
  const [isCheckingLocalStorage, setIsCheckingLocalStorage] =
    useState<boolean>(true)

  useEffect(() => {
    async function getCatechist() {
      if (!user) {
        setIsCheckingLocalStorage(true)
        const token = localStorage.getItem('auth')
        if (token) {
          const catechist = await CatechistRepository.getCatechist(token)
          setUser(catechist)
        }
      }
    }
    getCatechist().finally(() => setIsCheckingLocalStorage(false))
  }, [user])

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
    setUser(null)
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isCheckingLocalStorage }}
    >
      {children}
    </AuthContext.Provider>
  )
}
