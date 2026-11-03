import { TOKEN_KEY } from '@/services/api'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist } from '@/Types'
import { ReactNode, createContext, useEffect, useState } from 'react'

const MUST_CHANGE_PASSWORD_KEY = 'mustChangePassword'

export interface AuthType {
  user: catechist | null
  login: (email: string, password: string) => Promise<catechist>
  logout: () => void
  isCheckingLocalStorage: boolean
  // Enquanto true, o catequista ainda usa a senha padrão e precisa trocá-la
  mustChangePassword: boolean
  setPasswordAsChanged: () => void
  refreshUser: () => Promise<void>
}
export const AuthContext = createContext({} as AuthType)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<catechist | null>(null)
  const [isCheckingLocalStorage, setIsCheckingLocalStorage] =
    useState<boolean>(true)
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(
    localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true',
  )

  useEffect(() => {
    async function getCatechist() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        try {
          setUser(await CatechistRepository.getProfile())
        } catch {
          logout()
        }
      }
    }
    getCatechist().finally(() => setIsCheckingLocalStorage(false))
  }, [])

  async function refreshUser() {
    setUser(await CatechistRepository.getProfile())
  }

  async function login(email: string, password: string): Promise<catechist> {
    const { accessToken, mustChangePassword } = await CatechistRepository.login(
      email,
      password,
    )
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, String(mustChangePassword))
    setMustChangePassword(mustChangePassword)

    const catechist = await CatechistRepository.getProfile()
    setUser(catechist)
    return catechist
  }

  function setPasswordAsChanged() {
    localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
    setMustChangePassword(false)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
    setMustChangePassword(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isCheckingLocalStorage,
        mustChangePassword,
        setPasswordAsChanged,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
