import catequeseLogo from '@/assets/catequese-logo.svg'
import { APP_NAME, PASSWORD_RESET_BY_EMAIL } from '@/lib/config'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { Button, Input } from '@nextui-org/react'
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

// "Esqueci minha senha": manda um link por e-mail (vale 1 hora)
export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSending(true)
    try {
      await CatechistRepository.requestPasswordReset(email.trim())
      setIsSent(true)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bunker-50">
      <header className="flex h-[4.5rem] items-center gap-3 border-b border-white/5 bg-bunker-950 px-4 sm:px-8">
        <img className="w-11" src={catequeseLogo} alt="" />
        <span className="text-sm font-semibold tracking-wide text-white">
          {APP_NAME}
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-bunker-200/70 bg-white p-8 shadow-lg shadow-bunker-900/5"
        >
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-bunker-900">
              Esqueci minha senha
            </h1>
            {PASSWORD_RESET_BY_EMAIL && (
              <p className="text-sm text-bunker-500">
                Informe o e-mail do seu cadastro e enviaremos um link para criar
                uma senha nova.
              </p>
            )}
          </div>
          {!PASSWORD_RESET_BY_EMAIL ? (
            <div className="flex flex-col gap-3 rounded-lg bg-bunker-50 p-4 text-sm text-bunker-700">
              <p>
                <strong>Catequista:</strong> peça uma senha temporária à
                coordenação da sua paróquia. Ela cria uma senha nova para você,
                que será trocada no primeiro acesso.
              </p>
              <p>
                <strong>Coordenador:</strong> fale com o suporte do sistema.
              </p>
            </div>
          ) : isSent ? (
            <p className="rounded-lg bg-bunker-50 p-4 text-sm text-bunker-700">
              Se existir uma conta com esse e-mail, o link já está a caminho.
              Ele vale por 1 hora. Confira também a caixa de spam.
            </p>
          ) : (
            <>
              <Input
                type="email"
                label="E-mail"
                autoComplete="username"
                value={email}
                onValueChange={setEmail}
                isRequired
              />
              <Button
                color="primary"
                type="submit"
                size="lg"
                className="w-full font-medium"
                isLoading={isSending}
              >
                Enviar link
              </Button>
            </>
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
