import { APP_NAME } from '@/lib/config'
import { ParishRepository } from '@/services/repositories/parishRepository'
import { parish, parishChanges } from '@/Types'
import { setCurrentParish } from '@/utils/parish'
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AuthContext } from './AuthContext'

interface ParishType {
  // null enquanto carrega (ou sem login)
  parish: parish | null
  isLoading: boolean
  // Salva as configurações e já passa a usar os valores novos
  updateParish: (changes: parishChanges) => Promise<parish>
}

export const ParishContext = createContext({} as ParishType)

interface ParishProviderProps {
  children: ReactNode
}

// A paróquia de quem está logado: nome, DDD, contatos, valor do carnê...
// Carrega junto com o login e vale para o app inteiro
export function ParishProvider({ children }: ParishProviderProps) {
  const { user } = useContext(AuthContext)
  const [parish, setParish] = useState<parish | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const apply = useCallback((value: parish | null) => {
    setParish(value)
    // PDFs, DDD dos telefones e mensagens leem daqui (fora do React)
    setCurrentParish(value)
    document.title = value ? `${value.name} · ${APP_NAME}` : APP_NAME
  }, [])

  useEffect(() => {
    if (!user?.id) {
      apply(null)
      return
    }
    let isCurrent = true
    setIsLoading(true)
    ParishRepository.getCurrent()
      .then((value) => isCurrent && apply(value))
      .catch(console.error)
      .finally(() => isCurrent && setIsLoading(false))
    return () => {
      isCurrent = false
    }
  }, [user?.id, apply])

  async function updateParish(changes: parishChanges) {
    const updated = await ParishRepository.update(changes)
    apply(updated)
    return updated
  }

  return (
    <ParishContext.Provider value={{ parish, isLoading, updateParish }}>
      {children}
    </ParishContext.Provider>
  )
}
