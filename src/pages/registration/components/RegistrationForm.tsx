import { PhoneInput } from '@/components/PhoneInput'
import { fieldsetClassName, legendClassName } from '@/components/tableStyles'
import { documentKind, registrationSegment } from '@/Types'
import { RegistrationRepository } from '@/services/repositories/registrationRepository'
import { calculateAge, fromCalendarDate, toCalendarDate } from '@/utils/date'
import {
  ageRangeLabel,
  documentFields,
  getRegistrationSegment,
  isAgeOutOfRange,
  registrationMaritalStatuses,
  requiredDocuments,
  shirtSizes,
} from '@/utils/registration'
import {
  birthDate,
  optionalPersonName,
  optionalText,
  personName,
  requiredText,
} from '@/utils/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Checkbox,
  CircularProgress,
  DatePicker,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react'
import { Warning } from '@phosphor-icons/react'
import { I18nProvider } from '@react-aria/i18n'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { Control, Controller, FieldErrors, useForm } from 'react-hook-form'
import { z } from 'zod'
import { DocumentUpload, preparedDocument } from './DocumentUpload'

// refine (e não enum): um rádio vazio não impede as demais regras de rodarem,
// então todos os erros aparecem de uma vez
const yesNo = z
  .string()
  .refine(
    (value) => value === 'true' || value === 'false',
    'Selecione uma opção',
  )

function hasValidPhone(value: string) {
  const digits = value.replace(/\D/g, '').length
  return digits === 10 || digits === 11
}

function hasValidOptionalPhone(value: string) {
  const digits = value.replace(/\D/g, '').length
  return digits === 0 || digits === 10 || digits === 11
}

const PHONE_ERROR = 'Telefone inválido. Use DDD + número'

// Cada resposta de sim/não fica como texto ('true' | 'false'), vazio até a pessoa escolher
function buildSchema(segment: registrationSegment) {
  const info = getRegistrationSegment(segment)

  return z
    .object({
      name: personName(),
      birthday: birthDate(),
      address: requiredText(200).refine(
        (value) => value.length >= 5,
        'Informe o endereço completo',
      ),
      contactPhone: z.string().refine(hasValidPhone, PHONE_ERROR),
      guardianName: optionalPersonName(),
      guardianKinship: optionalPersonName(30),
      motherName: optionalPersonName(),
      motherPhone: z.string().refine(hasValidOptionalPhone, PHONE_ERROR),
      fatherName: optionalPersonName(),
      fatherPhone: z.string().refine(hasValidOptionalPhone, PHONE_ERROR),
      personWithSpecialNeeds: yesNo,
      specialNeedsDescription: optionalText(300),
      hasFoodRestriction: yesNo,
      foodRestriction: optionalText(200),
      releasedToGoAwayAlone: z.string(),
      pickupAuthorizedBy: optionalText(150),
      hasReceivedBaptism: yesNo,
      hasReceivedEucharist: z.string(),
      shirtSize: z.string().min(1, 'Escolha o tamanho'),
      maritalStatus: z.string(),
      livesWithPartner: z.string(),
      // Campo-armadilha para robôs: pessoas nunca preenchem
      website: z.string().max(200),
      acceptedTerms: z
        .boolean()
        .refine(
          (value) => value,
          'É preciso concordar com o termo para enviar',
        ),
    })
    .superRefine((data, context) => {
      const require = (
        path: keyof typeof data,
        ok: unknown,
        message: string,
      ) => {
        if (!ok) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [path],
            message,
          })
        }
      }

      require('specialNeedsDescription', data.personWithSpecialNeeds !==
        'true' || data.specialNeedsDescription, 'Informe qual')
      require('foodRestriction', data.hasFoodRestriction !== 'true' ||
        data.foodRestriction, 'Informe qual')

      if (info.isAdult) {
        require('maritalStatus', data.maritalStatus, 'Selecione o estado civil')
        require('livesWithPartner', data.livesWithPartner, 'Selecione uma opção')
      } else {
        require('guardianName', data.guardianName, 'Campo obrigatório')
        require('guardianKinship', data.guardianKinship, 'Campo obrigatório')
        require('releasedToGoAwayAlone', data.releasedToGoAwayAlone, 'Selecione uma opção')
        require('pickupAuthorizedBy', data.releasedToGoAwayAlone !== 'false' ||
          data.pickupAuthorizedBy, 'Informe quem pode buscar')
      }
      if (info.asksEucharist) {
        require('hasReceivedEucharist', data.hasReceivedEucharist, 'Selecione uma opção')
      }
    })
}

type FormValues = {
  name: string
  birthday: string
  address: string
  contactPhone: string
  guardianName: string
  guardianKinship: string
  motherName: string
  motherPhone: string
  fatherName: string
  fatherPhone: string
  personWithSpecialNeeds: string
  specialNeedsDescription: string
  hasFoodRestriction: string
  foodRestriction: string
  releasedToGoAwayAlone: string
  pickupAuthorizedBy: string
  hasReceivedBaptism: string
  hasReceivedEucharist: string
  shirtSize: string
  maritalStatus: string
  livesWithPartner: string
  website: string
  acceptedTerms: boolean
}

const defaultValues: FormValues = {
  name: '',
  birthday: '',
  address: '',
  contactPhone: '',
  guardianName: '',
  guardianKinship: '',
  motherName: '',
  motherPhone: '',
  fatherName: '',
  fatherPhone: '',
  personWithSpecialNeeds: '',
  specialNeedsDescription: '',
  hasFoodRestriction: '',
  foodRestriction: '',
  releasedToGoAwayAlone: '',
  pickupAuthorizedBy: '',
  hasReceivedBaptism: '',
  hasReceivedEucharist: '',
  shirtSize: '',
  maritalStatus: '',
  livesWithPartner: '',
  website: '',
  acceptedTerms: false,
}

interface YesNoFieldProps {
  control: Control<FormValues>
  // Só campos de texto (as respostas de sim/não); o checkbox do termo é à parte
  name: Exclude<keyof FormValues, 'acceptedTerms'>
  label: string
  errors: FieldErrors<FormValues>
  yesLabel?: string
  noLabel?: string
}

function YesNoField({
  control,
  name,
  label,
  errors,
  yesLabel = 'Sim',
  noLabel = 'Não',
}: YesNoFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <RadioGroup
          label={label}
          orientation="horizontal"
          value={field.value}
          onValueChange={field.onChange}
          isInvalid={Boolean(errors[name])}
          errorMessage={errors[name]?.message}
          classNames={{ label: 'text-sm text-bunker-700' }}
        >
          <Radio value="true" classNames={{ label: 'text-sm text-bunker-800' }}>
            {yesLabel}
          </Radio>
          <Radio
            value="false"
            classNames={{ label: 'text-sm text-bunker-800' }}
          >
            {noLabel}
          </Radio>
        </RadioGroup>
      )}
    />
  )
}

// Mensagem de erro em português para quem não é da área
function describeError(error: unknown) {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Sem conexão com o servidor. Verifique a internet e tente de novo'
    }
    const status = error.response.status
    const message = error.response.data?.message
    if (status === 413) {
      return 'Os arquivos são grandes demais. Envie fotos menores ou PDFs mais leves'
    }
    if (Array.isArray(message)) {
      return `Confira os campos: ${message
        .map((item) => (typeof item === 'string' ? item : item.message))
        .filter(Boolean)
        .join('; ')}`
    }
    if (typeof message === 'string') {
      return message
    }
  }
  return 'Não foi possível enviar agora. Tente novamente em instantes'
}

interface RegistrationFormProps {
  segment: registrationSegment
  onBack: () => void
  onDone: (protocol: string) => void
}

export function RegistrationForm({
  segment,
  onBack,
  onDone,
}: RegistrationFormProps) {
  const info = getRegistrationSegment(segment)
  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(segment)),
    defaultValues,
  })
  const [documents, setDocuments] = useState<
    Partial<Record<documentKind, preparedDocument>>
  >({})
  const [documentErrors, setDocumentErrors] = useState<
    Partial<Record<documentKind, string>>
  >({})
  const [submitError, setSubmitError] = useState('')

  const age = calculateAge(watch('birthday'))
  const hasSpecialNeeds = watch('personWithSpecialNeeds') === 'true'
  const hasFoodRestriction = watch('hasFoodRestriction') === 'true'
  const releasedAlone = watch('releasedToGoAwayAlone')
  const maritalStatus = watch('maritalStatus')
  const livesWithPartner = watch('livesWithPartner') === 'true'
  // Quem assina o termo: o próprio adulto ou o responsável pelo menor
  const signerName = info.isAdult ? watch('name') : watch('guardianName')

  const required = requiredDocuments({
    segment,
    hasReceivedBaptism: watch('hasReceivedBaptism') === 'true',
    hasReceivedEucharist: watch('hasReceivedEucharist') === 'true',
    maritalStatus,
  })

  function scrollToFirstError() {
    setTimeout(() => {
      document
        .querySelector('[data-invalid="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  async function onSubmit(form: FormValues) {
    setSubmitError('')

    const missing = required.filter((kind) => !documents[kind])
    if (missing.length) {
      setDocumentErrors(
        Object.fromEntries(
          missing.map((kind) => [kind, 'Envie este documento']),
        ),
      )
      scrollToFirstError()
      return
    }

    const yes = (value: string) => value === 'true'
    const data = {
      segment,
      name: form.name,
      birthday: form.birthday,
      address: form.address,
      contactPhone: form.contactPhone,
      ...(info.isAdult
        ? {
            maritalStatus: form.maritalStatus,
            livesWithPartner: yes(form.livesWithPartner),
          }
        : {
            guardianName: form.guardianName,
            guardianKinship: form.guardianKinship,
            motherName: form.motherName,
            motherPhone: form.motherPhone,
            fatherName: form.fatherName,
            fatherPhone: form.fatherPhone,
          }),
      personWithSpecialNeeds: yes(form.personWithSpecialNeeds),
      specialNeedsDescription: form.specialNeedsDescription,
      foodRestriction: yes(form.hasFoodRestriction) ? form.foodRestriction : '',
      releasedToGoAwayAlone: info.isAdult
        ? true
        : yes(form.releasedToGoAwayAlone),
      pickupAuthorizedBy: form.pickupAuthorizedBy,
      hasReceivedBaptism: yes(form.hasReceivedBaptism),
      hasReceivedEucharist: info.asksEucharist
        ? yes(form.hasReceivedEucharist)
        : false,
      shirtSize: form.shirtSize,
      website: form.website,
      acceptedTerms: form.acceptedTerms,
    }

    const files: Record<string, Blob> = {}
    const fileNames: Record<string, string> = {}
    for (const kind of required) {
      const field = documentFields[kind]
      files[field] = documents[kind]!.blob
      fileNames[field] = documents[kind]!.name
    }

    try {
      const { protocol } = await RegistrationRepository.submit(
        data,
        files,
        fileNames,
      )
      onDone(protocol)
    } catch (error) {
      setSubmitError(describeError(error))
      scrollToFirstError()
    }
  }

  function setDocument(kind: documentKind, value?: preparedDocument) {
    setDocuments((current) => ({ ...current, [kind]: value }))
    setDocumentErrors((current) => ({ ...current, [kind]: undefined }))
  }

  const selectClassNames = {
    listbox: 'text-bunker-800',
    selectorIcon: 'text-bunker-500',
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-bunker-900">
            Inscrição – {info.title}
          </h2>
          <p className="text-sm text-bunker-500">
            {ageRangeLabel(info)}. Todos os campos são obrigatórios, exceto os
            marcados como opcionais.
          </p>
        </div>
        <Button size="sm" variant="light" onPress={onBack}>
          Trocar etapa
        </Button>
      </div>

      <fieldset className={fieldsetClassName}>
        <legend className={legendClassName}>
          {info.isAdult ? 'Seus dados' : 'Dados do catequizando'}
        </legend>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Nome completo"
              autoComplete="off"
              {...field}
              isInvalid={Boolean(errors.name)}
              errorMessage={errors.name?.message}
            />
          )}
        />
        <div className="flex flex-col gap-4 sm:flex-row">
          <I18nProvider locale="pt-BR">
            <Controller
              name="birthday"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Data de nascimento"
                  value={toCalendarDate(field.value)}
                  onChange={(date) =>
                    field.onChange(fromCalendarDate(date) ?? '')
                  }
                  isInvalid={Boolean(errors.birthday)}
                  errorMessage={errors.birthday?.message}
                  showMonthAndYearPickers
                />
              )}
            />
          </I18nProvider>
          <Input
            label="Idade"
            isReadOnly
            className="sm:max-w-32"
            value={age === undefined ? '' : `${age} anos`}
          />
        </div>
        {isAgeOutOfRange(info, age) && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <Warning size={18} className="mt-0.5 shrink-0" />
            <span>
              A idade informada não está na faixa desta etapa (
              {ageRangeLabel(info)}). Confira a etapa escolhida; a coordenação
              vai analisar.
            </span>
          </p>
        )}
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input
              label="Endereço completo"
              autoComplete="off"
              {...field}
              isInvalid={Boolean(errors.address)}
              errorMessage={errors.address?.message}
            />
          )}
        />
      </fieldset>

      <fieldset className={fieldsetClassName}>
        <legend className={legendClassName}>
          {info.isAdult ? 'Contato' : 'Responsável principal'}
        </legend>
        {!info.isAdult && (
          <>
            <Controller
              name="guardianName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Nome do responsável principal"
                  autoComplete="off"
                  {...field}
                  isInvalid={Boolean(errors.guardianName)}
                  errorMessage={errors.guardianName?.message}
                />
              )}
            />
            <Controller
              name="guardianKinship"
              control={control}
              render={({ field }) => (
                <Input
                  label="Parentesco"
                  placeholder="Ex.: mãe, pai, avó"
                  autoComplete="off"
                  {...field}
                  isInvalid={Boolean(errors.guardianKinship)}
                  errorMessage={errors.guardianKinship?.message}
                />
              )}
            />
          </>
        )}
        <Controller
          name="contactPhone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              label="Celular (WhatsApp) para avisos via grupo"
              value={field.value}
              onChange={field.onChange}
              isInvalid={Boolean(errors.contactPhone)}
              errorMessage={errors.contactPhone?.message}
            />
          )}
        />
        {!info.isAdult && (
          <div className="flex flex-col gap-3 border-t border-bunker-200 pt-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-bunker-700">
                Pai e mãe (opcional)
              </span>
              <span className="text-xs text-bunker-500">
                Se o responsável principal for o pai ou a mãe, não precisa
                preencher de novo aqui.
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Controller
                name="motherName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Nome da mãe"
                    autoComplete="off"
                    {...field}
                    isInvalid={Boolean(errors.motherName)}
                    errorMessage={errors.motherName?.message}
                  />
                )}
              />
              <Controller
                name="motherPhone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    label="Celular da mãe"
                    value={field.value}
                    onChange={field.onChange}
                    isInvalid={Boolean(errors.motherPhone)}
                    errorMessage={errors.motherPhone?.message}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Controller
                name="fatherName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Nome do pai"
                    autoComplete="off"
                    {...field}
                    isInvalid={Boolean(errors.fatherName)}
                    errorMessage={errors.fatherName?.message}
                  />
                )}
              />
              <Controller
                name="fatherPhone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    label="Celular do pai"
                    value={field.value}
                    onChange={field.onChange}
                    isInvalid={Boolean(errors.fatherPhone)}
                    errorMessage={errors.fatherPhone?.message}
                  />
                )}
              />
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className={fieldsetClassName}>
        <legend className={legendClassName}>Saúde e saída</legend>
        <YesNoField
          control={control}
          errors={errors}
          name="personWithSpecialNeeds"
          label="Possui alguma necessidade ou atenção especial?"
        />
        {hasSpecialNeeds && (
          <Controller
            name="specialNeedsDescription"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Qual?"
                minRows={2}
                {...field}
                isInvalid={Boolean(errors.specialNeedsDescription)}
                errorMessage={errors.specialNeedsDescription?.message}
              />
            )}
          />
        )}
        <YesNoField
          control={control}
          errors={errors}
          name="hasFoodRestriction"
          label="Possui restrição alimentar?"
        />
        {hasFoodRestriction && (
          <Controller
            name="foodRestriction"
            control={control}
            render={({ field }) => (
              <Input
                label="Qual?"
                {...field}
                isInvalid={Boolean(errors.foodRestriction)}
                errorMessage={errors.foodRestriction?.message}
              />
            )}
          />
        )}
        {!info.isAdult && (
          <>
            <YesNoField
              control={control}
              errors={errors}
              name="releasedToGoAwayAlone"
              label="O catequizando está autorizado a ir embora sozinho?"
            />
            {releasedAlone === 'false' && (
              <Controller
                name="pickupAuthorizedBy"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Quem está autorizado a buscá-lo?"
                    {...field}
                    isInvalid={Boolean(errors.pickupAuthorizedBy)}
                    errorMessage={errors.pickupAuthorizedBy?.message}
                  />
                )}
              />
            )}
          </>
        )}
      </fieldset>

      <fieldset className={fieldsetClassName}>
        <legend className={legendClassName}>Sacramentos já recebidos</legend>
        <YesNoField
          control={control}
          errors={errors}
          name="hasReceivedBaptism"
          label="Batismo"
          yesLabel={info.isAdult ? 'Sou batizado(a)' : 'É batizado(a)'}
          noLabel={info.isAdult ? 'Não sou batizado(a)' : 'Não é batizado(a)'}
        />
        {info.asksEucharist && (
          <YesNoField
            control={control}
            errors={errors}
            name="hasReceivedEucharist"
            label="1ª Eucaristia"
            yesLabel={
              info.isAdult ? 'Tenho a 1ª Eucaristia' : 'Tem a 1ª Eucaristia'
            }
            noLabel={
              info.isAdult
                ? 'Não tenho a 1ª Eucaristia'
                : 'Não tem a 1ª Eucaristia'
            }
          />
        )}
      </fieldset>

      {info.isAdult && (
        <fieldset className={fieldsetClassName}>
          <legend className={legendClassName}>Estado civil</legend>
          <Controller
            name="maritalStatus"
            control={control}
            render={({ field }) => (
              <Select
                label="Estado civil"
                classNames={selectClassNames}
                selectedKeys={field.value ? [field.value] : []}
                onChange={(event) => field.onChange(event.target.value)}
                isInvalid={Boolean(errors.maritalStatus)}
                errorMessage={errors.maritalStatus?.message}
              >
                {registrationMaritalStatuses.map((status) => (
                  <SelectItem key={status}>{status}</SelectItem>
                ))}
              </Select>
            )}
          />
          <YesNoField
            control={control}
            errors={errors}
            name="livesWithPartner"
            label="Mora junto com outra pessoa?"
          />
          {livesWithPartner && maritalStatus !== 'Casado(a) no religioso' && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Será necessário se casar para receber o sacramento.
            </p>
          )}
        </fieldset>
      )}

      <fieldset className={fieldsetClassName}>
        <legend className={legendClassName}>Camiseta do sacramento</legend>
        <Controller
          name="shirtSize"
          control={control}
          render={({ field }) => (
            <Select
              label="Tamanho (sujeito a confirmação)"
              description="Não trabalhamos com baby look."
              classNames={selectClassNames}
              selectedKeys={field.value ? [field.value] : []}
              onChange={(event) => field.onChange(event.target.value)}
              isInvalid={Boolean(errors.shirtSize)}
              errorMessage={errors.shirtSize?.message}
            >
              {shirtSizes.map((size) => (
                <SelectItem key={size}>{size}</SelectItem>
              ))}
            </Select>
          )}
        />
      </fieldset>

      <fieldset className={fieldsetClassName}>
        <legend className={legendClassName}>Documentos</legend>
        <p className="text-sm text-bunker-600">
          Envie uma foto nítida (a câmera do celular serve) ou um PDF de cada
          documento. Não recebemos inscrições com documentos faltando.
        </p>
        {required.map((kind) => (
          <DocumentUpload
            key={kind}
            kind={kind}
            label={
              kind === 'PERSON_ID' && info.isAdult
                ? 'Certidão de nascimento, RG ou CNH'
                : undefined
            }
            hint={
              kind === 'PERSON_ID'
                ? info.isAdult
                  ? undefined
                  : 'Da criança ou do jovem.'
                : undefined
            }
            value={documents[kind]}
            error={documentErrors[kind]}
            onChange={(document) => setDocument(kind, document)}
            onError={(message) =>
              setDocumentErrors((current) => ({ ...current, [kind]: message }))
            }
          />
        ))}
      </fieldset>

      <section
        data-invalid={Boolean(errors.acceptedTerms)}
        className={`flex flex-col gap-3 rounded-xl border bg-white p-4 text-sm text-bunker-700 ${errors.acceptedTerms ? 'border-danger' : 'border-bunker-200'}`}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
          Termo de compromisso
        </h3>
        <p>
          Estou ciente do horário da catequese: todos os domingos, das 8h às
          11h30, iniciando com a Santa Missa, e da obrigatoriedade da presença
          nos encontros e na Missa.
        </p>
        <p>
          Eu, <strong>{signerName || '______________'}</strong>,{' '}
          {info.isAdult ? (
            'catequizando(a) adulto(a),'
          ) : (
            <>
              responsável por{' '}
              <strong>{watch('name') || '______________'}</strong>,
            </>
          )}{' '}
          assumo o reto compromisso com a assídua presença nos encontros
          catequéticos aos domingos, iniciados às 8h com a Santa Missa e
          finalizando às 11h30. Me comprometo a estar presente nos dias de festa
          de preceito e nos eventos, assim como com a presença nas reuniões com
          os catequistas. Tenho conhecimento que a ausência e falta de preparo
          inviabilizará o recebimento dos sacramentos no tempo oportuno e
          declaro que concordo com o seguinte termo.
        </p>
        <Controller
          name="acceptedTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              isSelected={field.value}
              onValueChange={field.onChange}
              isInvalid={Boolean(errors.acceptedTerms)}
              classNames={{ label: 'text-sm font-medium text-bunker-900' }}
            >
              Li e concordo com o termo de compromisso
            </Checkbox>
          )}
        />
        {errors.acceptedTerms && (
          <p className="text-sm text-danger">{errors.acceptedTerms.message}</p>
        )}
      </section>

      {/* Campo-armadilha: fora da tela e fora da navegação por teclado */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Não preencha este campo
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </label>
      </div>

      {submitError && (
        <p
          data-invalid="true"
          className="rounded-lg bg-red-50 p-3 text-sm text-danger"
        >
          {submitError}
        </p>
      )}

      <Button
        color="primary"
        type="submit"
        size="lg"
        className="w-full font-medium"
        isDisabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <CircularProgress size="sm" aria-label="Enviando" />
            Enviando documentos...
          </span>
        ) : (
          'Enviar inscrição'
        )}
      </Button>
    </form>
  )
}
