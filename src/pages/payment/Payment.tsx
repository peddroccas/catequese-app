import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { InstallmentProvider } from '../../contexts/InstallmentContext'
import { NewInstallmentForm } from './components/NewInstallmentForm'

export function Payment() {
  const auth = useAuth()

  useEffect(() => {
    auth()
  })
  return (
    <InstallmentProvider>
      <div className="mt-4 flex flex-grow flex-col items-center justify-start gap-8 pb-8 pt-4">
        <NewInstallmentForm />
      </div>
    </InstallmentProvider>
  )
}
