import catequeseLogo from '@/assets/catequese-logo.svg'
import { useAuth } from '@/hooks/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const loginFormSchema = z.object({
  email: z.string({ message: 'Campo obrigatório' }).email('Email inválido'),
  password: z.string().min(1, 'Campo obrigatório'),
})

export function Login() {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
  })
  const navigate = useNavigate()
  const { user, isCheckingLocalStorage, login } = useAuth()

  useEffect(() => {
    if (user) {
      navigate(user.role === 'MEMBER' ? '/classroom' : '/classrooms')
    }
  }, [user, isCheckingLocalStorage, navigate])

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handlelogin() {
    setHasUserSubmittedForm(true)
    try {
      // O redirecionamento (inclusive para trocar a senha padrão) é feito
      // pelo efeito acima e pelo Header
      await login(email, password)
    } catch (error) {
      setHasUserSubmittedForm(false)
      alert('Email ou senha inválidos')
      reset({ email: '', password: '' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bunker-50">
      <header className="flex h-[4.5rem] items-center gap-3 border-b border-white/5 bg-bunker-950 px-4 sm:px-8">
        <img className="w-11" src={catequeseLogo} alt="" />
        <span className="text-sm font-semibold tracking-wide text-white">
          Catequese
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit(handlelogin)}
          className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-bunker-200/70 bg-white p-8 shadow-lg shadow-bunker-900/5"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <img className="w-16" src={catequeseLogo} alt="" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-bunker-900">
                Bem-vindo(a)
              </h1>
              <p className="text-sm text-bunker-500">
                Entre com seu email e senha
              </p>
            </div>
          </div>
          <Controller
            name="email"
            control={control}
            rules={{
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value),
            }}
            render={({ field }) => (
              <Input
                label="Email"
                {...field}
                isInvalid={Boolean(errors.email)}
                errorMessage={String(errors.email?.message)}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              value: password,
              onChange: (e) => setPassword(e.target.value),
            }}
            render={({ field }) => (
              <Input
                label="Senha"
                type="password"
                {...field}
                isInvalid={Boolean(errors.password)}
                errorMessage={String(errors.password?.message)}
              />
            )}
          />
          <Button
            color="primary"
            className="w-full font-medium"
            type="submit"
            size="lg"
            isLoading={hasUserSubmittedForm}
          >
            Entrar
          </Button>
        </form>
      </main>
    </div>
  )
}
