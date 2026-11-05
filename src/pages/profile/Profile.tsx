import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
} from '@nextui-org/react'
import { useAuth } from '@/hooks/useAuth'
import { CatechistForm } from '../catechists/components/CatechistForm'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { getErrorMessage } from '@/services/api'
import { ChangeEvent, useRef, useState } from 'react'
import { resizeImage } from '@/utils/resizeImage'

const DEFAULT_PASSWORD = '123456'

const changePasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .max(72, 'A senha deve ter no máximo 72 caracteres')
      .refine((value) => value !== DEFAULT_PASSWORD, {
        message: 'A nova senha não pode ser a senha padrão',
      }),
    confirmation: z.string(),
  })
  .refine((form) => form.password === form.confirmation, {
    message: 'As senhas não conferem',
    path: ['confirmation'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>

function ChangePasswordForm() {
  const { mustChangePassword, setPasswordAsChanged } = useAuth()
  const [message, setMessage] = useState<string>('')
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { password: '', confirmation: '' },
  })

  async function handleChangePassword({ password }: ChangePasswordFormData) {
    setMessage('')
    try {
      await CatechistRepository.changeOwnPassword(password)
      setPasswordAsChanged()
      reset()
      setMessage('Senha alterada com sucesso!')
    } catch (error) {
      setMessage(getErrorMessage(error))
    }
  }

  return (
    <Card
      shadow="none"
      className="w-full border border-bunker-200/70 bg-white p-2 shadow-sm"
    >
      <CardHeader className="flex flex-col items-start gap-1">
        <h2 className="text-lg font-semibold text-bunker-900">Trocar senha</h2>
        {mustChangePassword && (
          <p className="text-sm text-amber-600">
            Você está usando a senha padrão. Crie uma nova senha para continuar.
          </p>
        )}
      </CardHeader>
      <CardBody>
        <form
          onSubmit={handleSubmit(handleChangePassword)}
          className="flex flex-col gap-4"
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                label="Nova senha"
                type="password"
                {...field}
                isInvalid={Boolean(errors.password)}
                errorMessage={errors.password?.message}
              />
            )}
          />
          <Controller
            name="confirmation"
            control={control}
            render={({ field }) => (
              <Input
                label="Confirme a nova senha"
                type="password"
                {...field}
                isInvalid={Boolean(errors.confirmation)}
                errorMessage={errors.confirmation?.message}
              />
            )}
          />
          {message && <p className="text-sm text-bunker-600">{message}</p>}
          <Button
            type="submit"
            color="primary"
            className="font-medium"
            isLoading={isSubmitting}
          >
            Salvar nova senha
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

function ProfilePhoto() {
  const { user, refreshUser } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function run(action: () => Promise<unknown>) {
    setMessage('')
    setIsSaving(true)
    try {
      await action()
      await refreshUser()
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('Escolha um arquivo de imagem')
      return
    }
    run(async () =>
      CatechistRepository.changeOwnAvatar(await resizeImage(file)),
    )
  }

  return (
    <Card
      shadow="none"
      className="w-full border border-bunker-200/70 bg-white p-2 shadow-sm"
    >
      <CardHeader>
        <h2 className="text-lg font-semibold text-bunker-900">
          Foto de perfil
        </h2>
      </CardHeader>
      <CardBody className="flex flex-row flex-wrap items-center gap-4">
        <Avatar
          src={user?.avatarUrl ?? undefined}
          className="h-20 w-20"
          classNames={{ base: 'bg-bunker-300', icon: 'text-bunker-800' }}
        />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              color="primary"
              className="font-medium"
              isLoading={isSaving}
              onPress={() => inputRef.current?.click()}
            >
              {user?.avatarUrl ? 'Trocar foto' : 'Enviar foto'}
            </Button>
            {user?.avatarUrl && (
              <Button
                variant="light"
                color="danger"
                isDisabled={isSaving}
                onPress={() => run(CatechistRepository.removeOwnAvatar)}
              >
                Remover
              </Button>
            )}
          </div>
          {message && <p className="text-sm text-red-600">{message}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardBody>
    </Card>
  )
}

export function Profile() {
  const { user } = useAuth()

  if (!user) {
    return <></>
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <ProfilePhoto />
        <ChangePasswordForm />
        <Card
          shadow="none"
          className="w-full border border-bunker-200/70 bg-white p-2 shadow-sm"
        >
          <CardHeader className="flex flex-col items-start gap-1">
            <h2 className="text-lg font-semibold text-bunker-900">
              Meus dados
            </h2>
            <p className="text-sm text-bunker-500">
              Para corrigir algum dado, fale com a coordenação.
            </p>
          </CardHeader>
          <CardBody>
            <CatechistForm data={user} isReadOnly />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
