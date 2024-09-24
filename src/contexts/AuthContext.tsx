import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist } from '@/Types'
import { ReactNode, createContext, useEffect, useState } from 'react'

interface AuthType {
  user: catechist
  signIn: (email: string, password: string) => Promise<catechist | void>
}
export const AuthContext = createContext({} as AuthType)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<catechist>({} as catechist)

  useEffect(() => {
    async function getCatechist() {
      const userId = localStorage.getItem('auth')
      if (userId) {
        const catechist = await CatechistRepository.getCatechist(userId)
        setUser(catechist)
        console.log(catechist)
      }
    }
    getCatechist()
  }, [])

  async function signIn(email: string, password: string) {
    const response = await CatechistRepository.signIn(email, password)
    if (response) {
      setUser(response)
      localStorage.setItem('auth', response.id!)
      return response
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn }}>
      {children}
    </AuthContext.Provider>
  )
}
