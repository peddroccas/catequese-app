import { BrandLogo } from '@/components/BrandLogo'
import { APP_NAME } from '@/lib/config'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { Button, Input } from '@nextui-org/react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

// Destino do link do e-mail: /redefinir-senha?token=...
export function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const tooShort = password.length > 0 && password.length < 8
  const mismatch = confirmation.length > 0 && confirmation !== password

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (password.length < 8 || password !== confirmation) return
    setIsSaving(true)
    try {
      await CatechistRepository.resetPasswordWithToken(token, password)
      toast.success('Senha alterada. Entre com a senha nova.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-creme-100">
      <header className="flex h-[4.5rem] items-center gap-3 border-b border-bunker-200/70 bg-white px-4 shadow-sm shadow-bunker-900/5 sm:px-8">
        <BrandLogo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-bunker-200/70 bg-white p-8 shadow-lg shadow-bunker-900/5"
        >
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-bunker-900">
              Criar senha nova
            </h1>
            <p className="text-sm text-bunker-500">
              Use pelo menos 8 caracteres.
            </p>
          </div>
          {token ? (
            <>
              <Input
                type="password"
                label="Senha nova"
                autoComplete="new-password"
                value={password}
                onValueChange={setPassword}
                isInvalid={tooShort}
                errorMessage="Mínimo de 8 caracteres"
                isRequired
              />
              <Input
                type="password"
                label="Repita a senha"
                autoComplete="new-password"
                value={confirmation}
                onValueChange={setConfirmation}
                isInvalid={mismatch}
                errorMessage="As senhas não conferem"
                isRequired
              />
              <Button
                color="primary"
                type="submit"
                size="lg"
                className="w-full font-medium"
                isLoading={isSaving}
              >
                Salvar senha
              </Button>
            </>
          ) : (
            <p className="rounded-lg bg-bunker-50 p-4 text-sm text-bunker-700">
              Este link está incompleto. Peça um novo em “Esqueci minha senha”.
            </p>
          )}
          <Link
            to="/login"
            className="text-center text-sm text-primary hover:underline"
          >
            Voltar para o login
          </Link>
        </form>
      </main>
    </div>
  )
}
