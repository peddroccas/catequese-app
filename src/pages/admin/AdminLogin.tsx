import catequeseLogo from '@/assets/catequese-logo.svg'
import { APP_NAME } from '@/lib/config'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import { AdminRepository } from '@/services/repositories/adminRepository'
import { Button, Input } from '@nextui-org/react'
import axios from 'axios'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Login do administrador do sistema (não é o login dos catequistas)
export function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await AdminRepository.login(email, password)
      navigate('/admin', { replace: true })
    } catch (error) {
      toast.error(
        axios.isAxiosError(error) && error.response?.status === 429
          ? getErrorMessage(error)
          : 'E-mail ou senha inválidos',
      )
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bunker-50">
      <header className="flex h-[4.5rem] items-center gap-3 border-b border-white/5 bg-bunker-950 px-4 sm:px-8">
        <img className="w-11" src={catequeseLogo} alt="" />
        <span className="text-base font-semibold tracking-wide text-white">
          {APP_NAME} · Administração
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-bunker-200/70 bg-white p-6 shadow-lg shadow-bunker-900/5"
        >
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-semibold text-bunker-900">
              Administração do sistema
            </h1>
            <p className="text-base text-bunker-500">
              Acesso restrito a quem cuida das paróquias.
            </p>
          </div>
          <Input
            type="email"
            label="E-mail"
            variant="bordered"
            autoComplete="username"
            value={email}
            onValueChange={setEmail}
            isRequired
          />
          <Input
            type="password"
            label="Senha"
            variant="bordered"
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
            isRequired
          />
          <Button type="submit" color="primary" isLoading={isSubmitting}>
            Entrar
          </Button>
        </form>
      </main>
    </div>
  )
}
