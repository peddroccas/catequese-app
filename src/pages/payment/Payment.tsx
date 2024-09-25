import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { InstallmentProvider } from '../../contexts/InstallmentContext'
import { NewInstallmentForm } from './components/NewInstallmentForm'
import { useNavigate } from 'react-router-dom'

export function Payment() {
  const navigate = useNavigate()
  const { user, isCheckingLocalStorage } = useAuth()

  useEffect(() => {
    if (!user && !isCheckingLocalStorage) {
      navigate('/login')
    }
  }, [user, isCheckingLocalStorage, navigate])

  return (
    <InstallmentProvider>
      <div className="mt-4 flex flex-grow flex-col items-center justify-start gap-8 pb-8 pt-4">
        <NewInstallmentForm />
      </div>
    </InstallmentProvider>
  )
}
