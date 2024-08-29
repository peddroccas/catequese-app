import { InstallmentProvider } from '../../contexts/InstallmentContext'
import { NewInstallmentForm } from './components/NewInstallmentForm'

export function Payment() {
  return (
    <InstallmentProvider>
      <div className="mt-4 flex flex-grow flex-col items-center justify-start gap-8 pb-8 pt-4">
        <NewInstallmentForm />
      </div>
    </InstallmentProvider>
  )
}
