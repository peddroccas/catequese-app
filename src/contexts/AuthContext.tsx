import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist } from '@/Types'
import { ReactNode, createContext, useEffect, useState } from 'react'

export interface AuthType {
  user: catechist | null
  login: (email: string, password: string) => Promise<catechist | void>
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
  console.log(user?.id)

  useEffect(() => {
    async function getCatechist() {
      setIsCheckingLocalStorage(true)
      const userId = localStorage.getItem('auth')
      if (userId) {
        const catechist = await CatechistRepository.getCatechist(userId)
        setUser(catechist)
      }
    }
    getCatechist().finally(() => setIsCheckingLocalStorage(false))
  }, [])

  async function login(email: string, password: string) {
    const response = await CatechistRepository.login(email, password)
    if (response) {
      setUser(response)
      localStorage.setItem('auth', response.id!)
      return response
    }
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
