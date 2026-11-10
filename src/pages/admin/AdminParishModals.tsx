import { TemporaryPasswordNotice } from '@/pages/catechists/components/TemporaryPasswordNotice'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import { AdminRepository } from '@/services/repositories/adminRepository'
import { adminParish } from '@/Types'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

// "Paróquia Santa Rita de Cássia" -> "santa-rita-de-cassia"
function suggestSlug(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/par[oó]quia|\bde\b|\bdo\b|\bda\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

// ---------------------------------------------------------------- nova paróquia

const newParishSchema = z.object({
  name: z.string().trim().min(3, 'Muito curto').max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Só letras minúsculas, números e hífen')
    .min(3, 'Mínimo de 3 letras')
    .max(40),
  dioceseName: z.string().trim().min(3, 'Muito curto').max(120),
  city: z.string().trim().min(2, 'Muito curto').max(80),
  state: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, 'Sigla com 2 letras'),
  areaCode: z
    .string()
    .trim()
    .regex(/^\d{2}$/, 'DDD com 2 números'),
  plan: z.string().trim().min(1, 'Informe o plano').max(30),
  coordinatorName: z.string().trim().min(2, 'Muito curto').max(80),
  coordinatorEmail: z.string().trim().email('E-mail inválido'),
})

type NewParishForm = z.infer<typeof newParishSchema>

interface NewParishModalProps {
  onClose: () => void
  onCreated: () => void
}

export function NewParishModal({ onClose, onCreated }: NewParishModalProps) {
  const [slugTouched, setSlugTouched] = useState(false)
  const [created, setCreated] = useState<{
    slug: string
    email: string
    password: string
  } | null>(null)
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewParishForm>({
    resolver: zodResolver(newParishSchema),
    defaultValues: {
      name: '',
      slug: '',
      dioceseName: '',
      city: '',
      state: '',
      areaCode: '',
      plan: 'FOUNDER',
      coordinatorName: '',
      coordinatorEmail: '',
    },
  })

  async function handleCreate(form: NewParishForm) {
    try {
      const result = await AdminRepository.create({
        ...form,
        state: form.state.toUpperCase(),
      })
      setCreated({
        slug: result.slug,
        email: result.coordinatorEmail,
        password: result.temporaryPassword,
      })
      onCreated()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const field = (
    name: keyof NewParishForm,
    label: string,
    extra: { description?: string; maxLength?: number; type?: string } = {},
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, ...rest } }) => (
        <Input
          {...rest}
          {...extra}
          label={label}
          variant="bordered"
          onChange={(event) => {
            onChange(event)
            if (name === 'name' && !slugTouched) {
              setValue('slug', suggestSlug(event.target.value), {
                shouldValidate: false,
              })
            }
            if (name === 'slug') {
              setSlugTouched(true)
            }
          }}
          isInvalid={Boolean(errors[name])}
          errorMessage={errors[name]?.message}
        />
      )}
    />
  )

  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="top"
      size="2xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader>
          {created ? 'Paróquia criada' : 'Nova paróquia'}
        </ModalHeader>
        {created ? (
          <>
            <ModalBody className="gap-3 text-base text-bunker-700">
              <p>
                Passe ao coordenador o e-mail <strong>{created.email}</strong>,
                a senha temporária abaixo e o endereço de inscrição{' '}
                <strong>
                  {window.location.origin}/inscricao/{created.slug}
                </strong>
                . A troca da senha é pedida no primeiro acesso.
              </p>
              <TemporaryPasswordNotice
                name={created.email}
                password={created.password}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Concluir
              </Button>
            </ModalFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(handleCreate)} noValidate>
            <ModalBody className="gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field('name', 'Nome da paróquia')}
                {field('slug', 'Endereço (slug)', {
                  description: 'Vai no link: /inscricao/<endereço>',
                  maxLength: 40,
                })}
                {field('dioceseName', 'Diocese ou arquidiocese')}
                {field('city', 'Cidade')}
                <div className="grid grid-cols-2 gap-4">
                  {field('state', 'UF', { maxLength: 2 })}
                  {field('areaCode', 'DDD', { maxLength: 2 })}
                </div>
                {field('plan', 'Plano')}
              </div>
              <h3 className="text-sm font-semibold text-bunker-700">
                Primeiro coordenador
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field('coordinatorName', 'Nome')}
                {field('coordinatorEmail', 'E-mail', { type: 'email' })}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button type="submit" color="primary" isLoading={isSubmitting}>
                Criar paróquia
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}

// ---------------------------------------------------- plano, vencimento e domínio

interface EditParishModalProps {
  parish: adminParish
  onClose: () => void
  onSaved: () => void
}

export function EditParishModal({
  parish,
  onClose,
  onSaved,
}: EditParishModalProps) {
  const [plan, setPlan] = useState(parish.plan)
  const [paidUntil, setPaidUntil] = useState(
    parish.paidUntil?.slice(0, 10) ?? '',
  )
  const [customDomain, setCustomDomain] = useState(parish.customDomain ?? '')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await AdminRepository.update(parish.id, {
        plan: plan.trim() || undefined,
        paidUntil: paidUntil || null,
        customDomain: customDomain.trim() || null,
      })
      toast.success('Paróquia atualizada')
      onSaved()
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader>{parish.name}</ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="Plano"
            variant="bordered"
            value={plan}
            onValueChange={setPlan}
          />
          <Input
            type="date"
            label="Pago até"
            variant="bordered"
            value={paidUntil}
            onValueChange={setPaidUntil}
            description="Só para controle: o sistema não suspende sozinho"
          />
          <Input
            label="Domínio próprio"
            variant="bordered"
            value={customDomain}
            onValueChange={setCustomDomain}
            placeholder="catequese.paroquia.org.br"
            description="Vazio = só o endereço padrão. Depois de salvar, o domínio precisa ser apontado para o app (veja o passo a passo do domínio)"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={isSaving}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ------------------------------------------------ senha do coordenador (suporte)

interface ResetCoordinatorModalProps {
  parish: adminParish
  onClose: () => void
}

export function ResetCoordinatorModal({
  parish,
  onClose,
}: ResetCoordinatorModalProps) {
  const [email, setEmail] = useState(parish.coordinators[0]?.email ?? '')
  const [result, setResult] = useState<{
    email: string
    password: string
  } | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  async function handleReset() {
    setIsResetting(true)
    try {
      const response = await AdminRepository.resetCoordinator(parish.id, email)
      setResult({ email: response.email, password: response.temporaryPassword })
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} placement="center" isDismissable={!result}>
      <ModalContent>
        <ModalHeader>Redefinir senha do coordenador</ModalHeader>
        <ModalBody className="gap-3 text-base text-bunker-700">
          {result ? (
            <TemporaryPasswordNotice
              name={result.email}
              password={result.password}
            />
          ) : parish.coordinators.length ? (
            <>
              <p>
                Gera uma senha temporária nova para quem coordena{' '}
                <strong>{parish.name}</strong>. A senha atual deixa de valer.
              </p>
              <Select
                label="Coordenador"
                variant="bordered"
                selectedKeys={[email]}
                onChange={(event) => setEmail(event.target.value)}
              >
                {parish.coordinators.map((coordinator) => (
                  <SelectItem key={coordinator.email}>
                    {`${coordinator.name} (${coordinator.email})`}
                  </SelectItem>
                ))}
              </Select>
            </>
          ) : (
            <p>Esta paróquia não tem coordenador ativo.</p>
          )}
        </ModalBody>
        <ModalFooter>
          {result ? (
            <Button color="primary" onPress={onClose}>
              Concluir
            </Button>
          ) : (
            <>
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="danger"
                onPress={handleReset}
                isLoading={isResetting}
                isDisabled={!email}
              >
                Redefinir
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ------------------------------------------------------------ apagar para sempre

interface DeleteParishModalProps {
  parish: adminParish
  onClose: () => void
  onDeleted: () => void
}

export function DeleteParishModal({
  parish,
  onClose,
  onDeleted,
}: DeleteParishModalProps) {
  const [confirmSlug, setConfirmSlug] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await AdminRepository.remove(parish.id, confirmSlug)
      toast.success(`${parish.name} foi apagada`)
      onDeleted()
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader className="text-danger">
          Apagar paróquia para sempre
        </ModalHeader>
        <ModalBody className="gap-3 text-base text-bunker-700">
          <p>
            Isto apaga <strong>todos os dados</strong> de {parish.name}:{' '}
            {parish.catechizingsCount} catequizandos, {parish.catechistsCount}{' '}
            catequistas, turmas, finanças, inscrições e os documentos enviados.
            Não tem volta.
          </p>
          <p>
            Antes, baixe os dados com <strong>Exportar dados</strong> e guarde o
            arquivo, se a paróquia for pedir.
          </p>
          <Input
            label={`Digite ${parish.slug} para confirmar`}
            variant="bordered"
            value={confirmSlug}
            onValueChange={setConfirmSlug}
            autoComplete="off"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={isDeleting}
            isDisabled={confirmSlug !== parish.slug}
          >
            Apagar tudo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
