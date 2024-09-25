import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Rites() {
  const navigate = useNavigate()
  const { user, isCheckingLocalStorage } = useAuth()

  useEffect(() => {
    if (!user && !isCheckingLocalStorage) {
      navigate('/login')
    }
  }, [user, isCheckingLocalStorage, navigate])

  return (
    <div>
      <p>Ritos</p>
    </div>
  )
}
