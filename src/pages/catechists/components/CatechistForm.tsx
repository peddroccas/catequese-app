import { PhoneInput } from '@/components/PhoneInput'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { catechist, role } from '@/Types'
import { calculateAge, fromCalendarDate, toCalendarDate } from '@/utils/date'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Checkbox,
  CircularProgress,
  DatePicker,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { I18nProvider } from '@react-aria/i18n'
import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const catechistFormSchema = z.object({
  name: z.string().trim().min(1, 'Campo obrigatório'),
  nickname: z.string().trim().min(1, 'Campo obrigatório'),
  birthday: z
    .string({ message: 'Campo obrigatório' })
    .min(1, 'Campo obrigatório'),
  email: z.string().email('Digite um email válido'),
  phone: z.string(),
  address: z.string(),
  role: z.enum(['COORDINATOR', 'MEMBER'], { message: 'Campo obrigatório' }),
  classroomIds: z.array(z.string()),
  hasReceivedBaptism: z.boolean(),
  hasReceivedEucharist: z.boolean(),
  hasReceivedConfirmation: z.boolean(),
  hasReceivedMarriage: z.boolean(),
})

type CatechistFormData = z.infer<typeof catechistFormSchema>

interface CatechistFormProps {
  data?: catechist
  isReadOnly?: boolean
  submitLabel?: string
  onSubmit?: (catechist: catechist) => Promise<void>
}

const selectClassNames = {
  listbox: 'text-bunker-800',
  selectorIcon: 'text-bunker-500',
}

export function CatechistForm({
  data,
  isReadOnly,
  submitLabel = 'Salvar',
  onSubmit,
}: CatechistFormProps) {
  const { classrooms } = useContext(ClassroomContext)
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CatechistFormData>({
    resolver: zodResolver(catechistFormSchema),
    defaultValues: {
      name: data?.name ?? '',
      nickname: data?.nickname ?? '',
      birthday: data?.birthday ?? '',
      email: data?.email ?? '',
      phone: data?.phone ?? '',
      address: data?.address ?? '',
      role: data?.role,
      classroomIds: data?.classroomIds ?? [],
      hasReceivedBaptism: data?.hasReceivedBaptism ?? false,
      hasReceivedEucharist: data?.hasReceivedEucharist ?? false,
      hasReceivedConfirmation: data?.hasReceivedConfirmation ?? false,
      hasReceivedMarriage: data?.hasReceivedMarriage ?? false,
    },
  })
  const [submitError, setSubmitError] = useState<string>('')
  const age = calculateAge(watch('birthday'))

  async function handleSubmitForm(form: CatechistFormData) {
    setSubmitError('')
    try {
      await onSubmit?.({ ...form, id: data?.id })
    } catch (error) {
      setSubmitError(String(error instanceof Error ? error.message : error))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Nome"
              {...field}
              isReadOnly={isReadOnly}
              isInvalid={Boolean(errors.name)}
              errorMessage={errors.name?.message}
            />
          )}
        />
        <Controller
          name="nickname"
          control={control}
          render={({ field }) => (
            <Input
              label="Apelido"
              {...field}
              isReadOnly={isReadOnly}
              isInvalid={Boolean(errors.nickname)}
              errorMessage={errors.nickname?.message}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <I18nProvider locale="pt-BR">
          <Controller
            name="birthday"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Data de nascimento"
                value={toCalendarDate(field.value)}
                onChange={(date) => field.onChange(fromCalendarDate(date))}
                isReadOnly={isReadOnly}
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

      <div className="flex flex-col gap-4 sm:flex-row">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              label="Email"
              {...field}
              isReadOnly={isReadOnly}
              isInvalid={Boolean(errors.email)}
              errorMessage={errors.email?.message}
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              label="Telefone"
              value={field.value}
              onChange={field.onChange}
              isReadOnly={isReadOnly}
            />
          )}
        />
      </div>

      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <Input label="Endereço" {...field} isReadOnly={isReadOnly} />
        )}
      />

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <Select
            label="Função"
            classNames={selectClassNames}
            selectedKeys={field.value ? [field.value] : []}
            onChange={(e) => field.onChange(e.target.value as role)}
            isDisabled={isReadOnly}
            isInvalid={Boolean(errors.role)}
            errorMessage={errors.role?.message}
          >
            <SelectItem key="MEMBER">Membro</SelectItem>
            <SelectItem key="COORDINATOR">Coordenador</SelectItem>
          </Select>
        )}
      />

      <Controller
        name="classroomIds"
        control={control}
        render={({ field }) => (
          <Select
            label="Turmas"
            selectionMode="multiple"
            isMultiline
            classNames={selectClassNames}
            selectedKeys={field.value}
            onSelectionChange={(keys) =>
              field.onChange(Array.from(keys).map(String))
            }
            isDisabled={isReadOnly}
          >
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id!}>{classroom.name}</SelectItem>
            ))}
          </Select>
        )}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(
          [
            ['hasReceivedBaptism', 'Batismo'],
            ['hasReceivedEucharist', '1ª Eucaristia'],
            ['hasReceivedConfirmation', 'Crisma'],
            ['hasReceivedMarriage', 'Sacramento do Matrimônio'],
          ] as const
        ).map(([name, label]) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <Checkbox
                isSelected={field.value}
                onValueChange={field.onChange}
                isReadOnly={isReadOnly}
                classNames={{ label: 'text-sm text-bunker-800' }}
              >
                {label}
              </Checkbox>
            )}
          />
        ))}
      </div>

      {submitError && <p className="text-sm text-danger">{submitError}</p>}

      {!isReadOnly && (
        <Button
          color="primary"
          className="w-full font-medium"
          type="submit"
          size="lg"
          isDisabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size="sm" /> : submitLabel}
        </Button>
      )}
    </form>
  )
}
