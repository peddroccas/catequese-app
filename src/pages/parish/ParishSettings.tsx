import { PageHeader } from '@/components/PageHeader'
import { PhoneInput } from '@/components/PhoneInput'
import { surfaceClassName } from '@/components/tableStyles'
import { useParish } from '@/hooks/useParish'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import { parish } from '@/Types'
import { centsToInput, parseCurrencyToCents } from '@/utils/currency'
import { isModuleEnabled } from '@/utils/modules'
import { maskPhone } from '@/utils/phone'
import { moneyAmount, requiredText } from '@/utils/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CircularProgress, Input, Textarea } from '@nextui-org/react'
import { Copy, LinkSimple, Plus, Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { CommitmentTerms } from '../registration/components/CommitmentTerms'
import { RegistrationPaymentNotice } from '../registration/components/RegistrationPaymentNotice'

const MAX_CONTACTS = 5

// '', '0', '0,00', 'R$ 0' = sem taxa de inscrição
function isZeroOrEmpty(value: string) {
  return /^[\sR$0.,]*$/.test(value)
}

const settingsSchema = z.object({
  name: requiredText(120).pipe(z.string().min(3, 'Muito curto')),
  dioceseName: requiredText(120).pipe(z.string().min(3, 'Muito curto')),
  city: requiredText(80),
  state: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, 'Use a sigla com 2 letras (ex.: DF)'),
  areaCode: z
    .string()
    .trim()
    .regex(/^\d{2}$/, 'Use o DDD com 2 números'),
  contacts: z
    .array(
      z.object({
        name: requiredText(80).pipe(z.string().min(2, 'Muito curto')),
        phone: z
          .string()
          .refine(
            (value) => /^\d{10,11}$/.test(value.replace(/\D/g, '')),
            'Telefone com DDD (10 ou 11 números)',
          ),
      }),
    )
    .max(MAX_CONTACTS),
  carneAmount: moneyAmount(),
  // Vazio ou zero = sem taxa
  registrationFee: z
    .string()
    .trim()
    .refine(
      (value) => isZeroOrEmpty(value) || parseCurrencyToCents(value) !== null,
      'Valor inválido. Use apenas números, ex.: 20,00',
    ),
  pixKey: z.string().trim().max(140, 'Chave muito longa'),
  pixHolderName: z.string().trim().max(120, 'Nome muito longo'),
  // Vazio = usa o primeiro contato da coordenação
  paymentReceiptPhone: z
    .string()
    .refine(
      (value) => value === '' || /^\d{10,11}$/.test(value.replace(/\D/g, '')),
      'Telefone com DDD (10 ou 11 números)',
    ),
  commitmentTerms: z
    .string()
    .max(4000, 'O termo pode ter no máximo 4000 caracteres'),
})

type SettingsForm = z.infer<typeof settingsSchema>

function toForm(parish: parish): SettingsForm {
  return {
    name: parish.name,
    dioceseName: parish.dioceseName,
    city: parish.city,
    state: parish.state,
    areaCode: parish.areaCode,
    contacts: parish.coordinationContacts.map((contact) => ({
      name: contact.name,
      phone: maskPhone(contact.phone),
    })),
    carneAmount: centsToInput(parish.carneAmountCents),
    registrationFee: parish.registrationFeeCents
      ? centsToInput(parish.registrationFeeCents)
      : '',
    pixKey: parish.pixKey ?? '',
    pixHolderName: parish.pixHolderName ?? '',
    paymentReceiptPhone: parish.paymentReceiptPhone
      ? maskPhone(parish.paymentReceiptPhone)
      : '',
    commitmentTerms: parish.commitmentTerms ?? '',
  }
}

// Dados da paróquia (só a coordenação): nome, contatos, carnê, taxa, PIX e termo
export function ParishSettings() {
  const { parish, updateParish } = useParish()

  if (!parish) {
    return (
      <div className="flex justify-center py-16">
        <CircularProgress aria-label="Carregando" />
      </div>
    )
  }

  return <SettingsView parish={parish} onSave={updateParish} />
}

interface SettingsViewProps {
  parish: parish
  onSave: ReturnType<typeof useParish>['updateParish']
}

function SettingsView({ parish, onSave }: SettingsViewProps) {
  const [copied, setCopied] = useState(false)
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: toForm(parish),
  })
  const contacts = useFieldArray({ control, name: 'contacts' })
  // Taxa que o formulário vai mostrar (null = sem taxa, nem PIX)
  const feeCents = isZeroOrEmpty(watch('registrationFee'))
    ? null
    : parseCurrencyToCents(watch('registrationFee'))

  // Vindo de “Inscrições” (/parish#pix), já mostra o PIX
  useEffect(() => {
    if (window.location.hash === '#pix') {
      document.getElementById('pix')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])
  const formUrl = `${window.location.origin}/inscricao/${parish.slug}`
  // Abas que o administrador desligou: o que é só delas some desta tela
  const hasFinances = isModuleEnabled(parish, 'finances')
  const hasRegistrations = isModuleEnabled(parish, 'registrations')

  async function handleSave(form: SettingsForm) {
    try {
      const saved = await onSave({
        name: form.name,
        dioceseName: form.dioceseName,
        city: form.city,
        state: form.state.toUpperCase(),
        areaCode: form.areaCode,
        coordinationContacts: form.contacts.map((contact) => ({
          name: contact.name,
          phone: contact.phone.replace(/\D/g, ''),
        })),
        carneAmountCents: parseCurrencyToCents(form.carneAmount) ?? 0,
        registrationFeeCents: isZeroOrEmpty(form.registrationFee)
          ? null
          : parseCurrencyToCents(form.registrationFee),
        pixKey: form.pixKey.trim() || null,
        pixHolderName: form.pixHolderName.trim() || null,
        paymentReceiptPhone:
          form.paymentReceiptPhone.replace(/\D/g, '') || null,
        commitmentTerms: form.commitmentTerms.trim() || null,
        // Ainda sem tela própria: mantém o que já está salvo
        logoUrl: parish.logoUrl,
        primaryColor: parish.primaryColor,
      })
      reset(toForm(saved))
      toast.success('Configurações salvas')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Não foi possível copiar. Selecione o link e copie.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleSave)}
      className="flex flex-grow flex-col gap-6"
      noValidate
    >
      <PageHeader
        title="Configurações da paróquia"
        description="Dados que aparecem nos documentos e no formulário de inscrição"
      >
        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          isDisabled={!isDirty}
        >
          Salvar
        </Button>
      </PageHeader>

      {hasRegistrations && (
        <section className={`${surfaceClassName} flex flex-col gap-4 p-5`}>
          <h2 className="text-lg font-semibold text-bunker-900">
            Link de inscrição
          </h2>
          <p className="text-sm text-bunker-500">
            Divulgue este endereço para as famílias se inscreverem (a
            coordenação abre e fecha as inscrições em “Inscrições”).
          </p>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              aria-label="Link de inscrição"
              value={formUrl}
              variant="bordered"
              startContent={
                <LinkSimple size={18} className="text-bunker-400" />
              }
              onFocus={(event) => (event.target as HTMLInputElement).select()}
            />
            <Button
              variant="bordered"
              startContent={<Copy size={18} />}
              onPress={handleCopy}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
        </section>
      )}

      <section className={`${surfaceClassName} flex flex-col gap-4 p-5`}>
        <h2 className="text-lg font-semibold text-bunker-900">Identificação</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Nome da paróquia"
                variant="bordered"
                isInvalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
              />
            )}
          />
          <Controller
            name="dioceseName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Diocese ou arquidiocese"
                variant="bordered"
                isInvalid={Boolean(errors.dioceseName)}
                errorMessage={errors.dioceseName?.message}
              />
            )}
          />
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Cidade"
                variant="bordered"
                isInvalid={Boolean(errors.city)}
                errorMessage={errors.city?.message}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="UF"
                  maxLength={2}
                  variant="bordered"
                  isInvalid={Boolean(errors.state)}
                  errorMessage={errors.state?.message}
                />
              )}
            />
            <Controller
              name="areaCode"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="DDD"
                  inputMode="numeric"
                  maxLength={2}
                  variant="bordered"
                  isInvalid={Boolean(errors.areaCode)}
                  errorMessage={errors.areaCode?.message}
                />
              )}
            />
          </div>
        </div>
        <p className="text-xs text-bunker-500">
          O nome, a diocese e a cidade vão no cabeçalho de todos os PDFs e
          planilhas. O DDD completa os telefones digitados sem ele.
        </p>
      </section>

      <section className={`${surfaceClassName} flex flex-col gap-4 p-5`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-bunker-900">
            Contatos da coordenação
          </h2>
          <Button
            size="sm"
            variant="flat"
            startContent={<Plus size={16} />}
            isDisabled={contacts.fields.length >= MAX_CONTACTS}
            onPress={() => contacts.append({ name: '', phone: '' })}
          >
            Adicionar
          </Button>
        </div>
        <p className="text-sm text-bunker-500">
          Aparecem no formulário de inscrição para a família tirar dúvidas.
        </p>
        {contacts.fields.length === 0 && (
          <p className="text-sm text-bunker-400">Nenhum contato cadastrado.</p>
        )}
        {contacts.fields.map((item, index) => (
          <div key={item.id} className="flex items-start gap-2">
            <Controller
              name={`contacts.${index}.name`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nome"
                  variant="bordered"
                  isInvalid={Boolean(errors.contacts?.[index]?.name)}
                  errorMessage={errors.contacts?.[index]?.name?.message}
                />
              )}
            />
            <Controller
              name={`contacts.${index}.phone`}
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Telefone"
                  variant="bordered"
                  isInvalid={Boolean(errors.contacts?.[index]?.phone)}
                  errorMessage={errors.contacts?.[index]?.phone?.message}
                />
              )}
            />
            <Button
              isIconOnly
              variant="light"
              color="danger"
              aria-label="Remover contato"
              className="mt-2"
              onPress={() => contacts.remove(index)}
            >
              <Trash size={18} />
            </Button>
          </div>
        ))}
      </section>

      {(hasFinances || hasRegistrations) && (
        <section className={`${surfaceClassName} flex flex-col gap-4 p-5`}>
          <h2 className="text-lg font-semibold text-bunker-900">Valores</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {hasFinances && (
              <Controller
                name="carneAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Valor do carnê de cada catequizando"
                    inputMode="decimal"
                    startContent={
                      <span className="text-sm text-bunker-500">R$</span>
                    }
                    variant="bordered"
                    isInvalid={Boolean(errors.carneAmount)}
                    errorMessage={errors.carneAmount?.message}
                  />
                )}
              />
            )}
            {hasRegistrations && (
              <Controller
                name="registrationFee"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Taxa de inscrição (opcional)"
                    inputMode="decimal"
                    startContent={
                      <span className="text-sm text-bunker-500">R$</span>
                    }
                    variant="bordered"
                    description="Vazio ou 0 = sem taxa (o formulário não mostra valor nem PIX)"
                    isInvalid={Boolean(errors.registrationFee)}
                    errorMessage={errors.registrationFee?.message}
                  />
                )}
              />
            )}
          </div>
        </section>
      )}

      {hasRegistrations && (
        <section
          id="pix"
          className={`${surfaceClassName} flex scroll-mt-24 flex-col gap-4 p-5`}
        >
          <h2 className="text-lg font-semibold text-bunker-900">
            PIX da inscrição
          </h2>
          <p className="text-sm text-bunker-500">
            Aparece no formulário de inscrição junto com a taxa e o pedido para
            a família mandar o comprovante pelo WhatsApp. Sem taxa ou sem chave,
            o formulário não mostra PIX.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="pixKey"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Chave PIX"
                  description="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                  variant="bordered"
                  isInvalid={Boolean(errors.pixKey)}
                  errorMessage={errors.pixKey?.message}
                />
              )}
            />
            <Controller
              name="pixHolderName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nome de quem recebe (opcional)"
                  description="Para a família conferir antes de pagar"
                  variant="bordered"
                  isInvalid={Boolean(errors.pixHolderName)}
                  errorMessage={errors.pixHolderName?.message}
                />
              )}
            />
            <Controller
              name="paymentReceiptPhone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="WhatsApp para o comprovante (opcional)"
                  description="Vazio = primeiro contato da coordenação"
                  variant="bordered"
                  isInvalid={Boolean(errors.paymentReceiptPhone)}
                  errorMessage={errors.paymentReceiptPhone?.message}
                />
              )}
            />
          </div>
          {watch('pixKey').trim() && !feeCents && (
            <p className="text-sm text-amber-700">
              Sem taxa de inscrição em “Valores”, o PIX não aparece no
              formulário.
            </p>
          )}
          {watch('pixKey').trim() && Boolean(feeCents) && (
            <div className="flex flex-col gap-2 rounded-xl border border-bunker-200 bg-bunker-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
                Como a família vai ver
              </h3>
              <RegistrationPaymentNotice
                feeCents={feeCents}
                pixKey={watch('pixKey').trim()}
                pixHolderName={watch('pixHolderName').trim() || null}
                receiptPhone={
                  watch('paymentReceiptPhone').replace(/\D/g, '') ||
                  watch('contacts')[0]?.phone.replace(/\D/g, '') ||
                  null
                }
              />
            </div>
          )}
        </section>
      )}

      <section className={`${surfaceClassName} flex flex-col gap-4 p-5`}>
        <h2 className="text-lg font-semibold text-bunker-900">
          Termo de compromisso
        </h2>
        <p className="text-sm text-bunker-500">
          Aparece no formulário de inscrição e na ficha impressa. Separe os
          parágrafos com uma linha em branco. Use{' '}
          <code className="rounded bg-bunker-100 px-1">{'{signer}'}</code> onde
          vai o nome de quem assina e{' '}
          <code className="rounded bg-bunker-100 px-1">{'{role}'}</code> para o
          vínculo (“responsável por Ana,”). Em branco, vale um termo padrão.
        </p>
        <Controller
          name="commitmentTerms"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              aria-label="Termo de compromisso"
              minRows={6}
              variant="bordered"
              isInvalid={Boolean(errors.commitmentTerms)}
              errorMessage={errors.commitmentTerms?.message}
            />
          )}
        />
        <div className="flex flex-col gap-2 rounded-xl border border-bunker-200 bg-bunker-50 p-4 text-sm text-bunker-700">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
            Como a família vai ver
          </h3>
          <CommitmentTerms
            template={watch('commitmentTerms')}
            signerName="Maria da Silva"
            isAdult={false}
            catechizingName="João"
          />
        </div>
      </section>
    </form>
  )
}
