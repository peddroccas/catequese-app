import { AuthContext } from '@/contexts/AuthContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const auth = () => {
    const userId = localStorage.getItem('auth')
    if (!user.id && !userId) {
      navigate('/signIn')
    }
  }

  return auth
}
