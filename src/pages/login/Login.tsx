import catequeseLogo from '@/assets/catequese-logo.svg'
import { useAuth } from '@/hooks/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CircularProgress, Input } from '@heroui/react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const loginFormSchema = z.object({
  email: z.string({ message: 'Campo obrigatório' }).email('Email inválido'),
  password: z.string().min(6).optional(),
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
      navigate('/classrooms')
    }
  }, [user, isCheckingLocalStorage, navigate])

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handlelogin() {
    setHasUserSubmittedForm(true)
    try {
      const user = await login(email, password)
      if (user.role === 'MEMBER') {
        navigate('/classroom')
      } else {
        if (user.role === 'COORDINATOR') {
          navigate('/classrooms')
        } else {
          throw new Error()
        }
      }
    } catch (error) {
      setHasUserSubmittedForm(false)
      alert('Credenciais inválidas')
      reset({ email: '', password: '' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bunker-950">
      <header className="flex h-20 items-center bg-bunker-900 p-4 duration-300">
        <img className="w-14" src={catequeseLogo} alt="" />
      </header>
      <main className="mx-10 mt-4 flex flex-col items-center gap-8 pb-8 pt-4">
        <form
          onSubmit={handleSubmit(handlelogin)}
          className="flex w-11/12 flex-col gap-4 rounded-xl bg-bunker-900 p-4 text-bunker-950 md:w-6/12 lg:w-5/12 2xl:w-3/12"
        >
          <h1 className="text-center text-2xl text-white">Login</h1>
          <Controller
            name="email"
            control={control}
            rules={{
              required: true,
              value: email,
              onChange: e => setEmail(e.target.value),
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
              onChange: e => setPassword(e.target.value),
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
            variant="solid"
            aria-labelledby="cadastro de catequizando"
            aria-label="cadastro de catequizando"
            className="w-full p-2 font-medium shadow shadow-black"
            type="submit"
            size="lg"
          >
            {hasUserSubmittedForm ? <CircularProgress /> : 'Entrar'}
          </Button>
        </form>
      </main>
    </div>
  )
}
