import { PhoneInput } from '@/components/PhoneInput'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import {
  catechizing,
  isAdultSegment,
  maritalStatus,
  maritalStatuses,
} from '@/Types'
import { calculateAge, fromCalendarDate, toCalendarDate } from '@/utils/date'
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
import { Plus, Trash } from '@phosphor-icons/react'
import { I18nProvider } from '@react-aria/i18n'
import { useContext, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

const catechizingFormSchema = z.object({
  name: z.string().trim().min(1, 'Campo obrigatório'),
  birthday: z
    .string({ message: 'Campo obrigatório' })
    .min(1, 'Campo obrigatório'),
  address: z.string(),
  classroomId: z
    .string({ message: 'Campo obrigatório' })
    .min(1, 'Campo obrigatório'),
  parents: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().trim().min(1, 'Campo obrigatório'),
      phone: z.string(),
      kinship: z.string(),
    }),
  ),
  hasReceivedBaptism: z.boolean(),
  hasReceivedEucharist: z.boolean(),
  hasReceivedMarriage: z.boolean(),
  releasedToGoAwayAlone: z.boolean(),
  personWithSpecialNeeds: z.boolean(),
  specialNeedsDescription: z.string(),
  maritalStatus: z.string(),
  livesWithPartner: z.string(),
})

type CatechizingFormData = z.infer<typeof catechizingFormSchema>

const emptyParent = { name: '', phone: '', kinship: '' }

function toFormData(data?: catechizing, classroomId?: string) {
  return {
    name: data?.name ?? '',
    birthday: data?.birthday ?? '',
    address: data?.address ?? '',
    classroomId: data?.classroomId ?? classroomId ?? '',
    parents: data?.parents.length ? data.parents : [emptyParent],
    hasReceivedBaptism: data?.hasReceivedBaptism ?? false,
    hasReceivedEucharist: data?.hasReceivedEucharist ?? false,
    hasReceivedMarriage: data?.hasReceivedMarriage ?? false,
    releasedToGoAwayAlone: data?.releasedToGoAwayAlone ?? false,
    personWithSpecialNeeds: data?.personWithSpecialNeeds ?? false,
    specialNeedsDescription: data?.specialNeedsDescription ?? '',
    maritalStatus: data?.maritalStatus ?? '',
    livesWithPartner:
      data?.livesWithPartner === null || data?.livesWithPartner === undefined
        ? ''
        : String(data.livesWithPartner),
  }
}

interface CatechizingFormProps {
  data?: catechizing
  classroomId?: string
  isReadOnly?: boolean
  submitLabel?: string
  onSubmit?: (catechizing: catechizing) => Promise<void>
}

export function CatechizingForm({
  data,
  classroomId,
  isReadOnly,
  submitLabel = 'Salvar',
  onSubmit,
}: CatechizingFormProps) {
  const { classrooms } = useContext(ClassroomContext)
  const {
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CatechizingFormData>({
    resolver: zodResolver(catechizingFormSchema),
    defaultValues: toFormData(data, classroomId),
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'parents' })
  const [submitError, setSubmitError] = useState<string>('')

  const selectedClassroom = classrooms.find(
    (classroom) => classroom.id === watch('classroomId'),
  )
  const isAdult = isAdultSegment(selectedClassroom?.segment)
  const age = calculateAge(watch('birthday'))
  const hasSpecialNeeds = watch('personWithSpecialNeeds')

  async function handleSubmitForm(form: CatechizingFormData) {
    if (!isAdult && !form.parents.length) {
      setError('parents', { message: 'Cadastre ao menos um responsável' })
      return
    }

    setSubmitError('')
    try {
      await onSubmit?.({
        id: data?.id,
        name: form.name,
        birthday: form.birthday,
        address: form.address,
        classroomId: form.classroomId,
        parents: form.parents,
        hasReceivedBaptism: form.hasReceivedBaptism,
        hasReceivedEucharist: form.hasReceivedEucharist,
        hasReceivedMarriage: form.hasReceivedMarriage,
        releasedToGoAwayAlone: form.releasedToGoAwayAlone,
        personWithSpecialNeeds: form.personWithSpecialNeeds,
        specialNeedsDescription:
          form.personWithSpecialNeeds && form.specialNeedsDescription
            ? form.specialNeedsDescription
            : null,
        maritalStatus:
          isAdult && form.maritalStatus
            ? (form.maritalStatus as maritalStatus)
            : null,
        livesWithPartner:
          isAdult && form.livesWithPartner
            ? form.livesWithPartner === 'true'
            : null,
      })
    } catch (error) {
      setSubmitError(String(error instanceof Error ? error.message : error))
    }
  }

  const checkboxClassNames = { label: 'text-sm text-bunker-800' }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-col gap-4"
    >
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

      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <Input label="Endereço" {...field} isReadOnly={isReadOnly} />
        )}
      />

      <Controller
        name="classroomId"
        control={control}
        render={({ field }) => (
          <Select
            label="Turma"
            classNames={{
              listbox: 'text-bunker-800',
              selectorIcon: 'text-bunker-500',
            }}
            selectedKeys={field.value ? [field.value] : []}
            onChange={(e) => field.onChange(e.target.value)}
            isDisabled={isReadOnly || Boolean(classroomId)}
            isInvalid={Boolean(errors.classroomId)}
            errorMessage={errors.classroomId?.message}
          >
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id!}>{classroom.name}</SelectItem>
            ))}
          </Select>
        )}
      />

      <fieldset className="flex flex-col gap-3 rounded-xl border border-bunker-200 bg-bunker-50/60 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-bunker-500">
          Responsáveis{isAdult && ' (opcional para adultos)'}
        </legend>
        {fields.map((parentField, index) => (
          <div
            key={parentField.id}
            className="flex flex-col gap-2 border-b border-bunker-200 pb-3 last:border-none last:pb-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-bunker-700">
                Responsável {index + 1}
              </span>
              {!isReadOnly && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="Remover responsável"
                  onPress={() => remove(index)}
                >
                  <Trash size={18} className="text-red-400" />
                </Button>
              )}
            </div>
            <Controller
              name={`parents.${index}.name`}
              control={control}
              render={({ field }) => (
                <Input
                  label="Nome do responsável"
                  {...field}
                  isReadOnly={isReadOnly}
                  isInvalid={Boolean(errors.parents?.[index]?.name)}
                  errorMessage={errors.parents?.[index]?.name?.message}
                />
              )}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Controller
                name={`parents.${index}.phone`}
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
              <Controller
                name={`parents.${index}.kinship`}
                control={control}
                render={({ field }) => (
                  <Input
                    label="Parentesco"
                    {...field}
                    isReadOnly={isReadOnly}
                  />
                )}
              />
            </div>
          </div>
        ))}
        {errors.parents?.message && (
          <p className="text-sm text-danger">{errors.parents.message}</p>
        )}
        {!isReadOnly && (
          <Button
            size="sm"
            variant="flat"
            startContent={<Plus size={16} />}
            onPress={() => append(emptyParent)}
            color="primary"
            className="self-start"
          >
            Adicionar responsável
          </Button>
        )}
      </fieldset>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(
          [
            ['hasReceivedBaptism', 'Batismo'],
            ['hasReceivedEucharist', '1ª Eucaristia'],
            ['hasReceivedMarriage', 'Sacramento do Matrimônio'],
            ['releasedToGoAwayAlone', 'Pode ir embora sozinho'],
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
                classNames={checkboxClassNames}
              >
                {label}
              </Checkbox>
            )}
          />
        ))}
      </div>

      <Controller
        name="personWithSpecialNeeds"
        control={control}
        render={({ field }) => (
          <Checkbox
            isSelected={field.value}
            onValueChange={field.onChange}
            isReadOnly={isReadOnly}
            classNames={checkboxClassNames}
          >
            Pessoa com necessidade especial
          </Checkbox>
        )}
      />
      {hasSpecialNeeds && (
        <Controller
          name="specialNeedsDescription"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Qual a necessidade especial?"
              minRows={2}
              {...field}
              isReadOnly={isReadOnly}
            />
          )}
        />
      )}

      {isAdult && (
        <fieldset className="flex flex-col gap-3 rounded-xl border border-bunker-200 bg-bunker-50/60 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-bunker-500">
            Adultos
          </legend>
          <Controller
            name="maritalStatus"
            control={control}
            render={({ field }) => (
              <Select
                label="Estado civil"
                classNames={{
                  listbox: 'text-bunker-800',
                  selectorIcon: 'text-bunker-500',
                }}
                selectedKeys={field.value ? [field.value] : []}
                onChange={(e) => field.onChange(e.target.value)}
                isDisabled={isReadOnly}
              >
                {maritalStatuses.map((status) => (
                  <SelectItem key={status}>{status}</SelectItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="livesWithPartner"
            control={control}
            render={({ field }) => (
              <RadioGroup
                label="Mora junto com outra pessoa?"
                orientation="horizontal"
                value={field.value}
                onValueChange={field.onChange}
                isReadOnly={isReadOnly}
                classNames={{ label: 'text-sm text-bunker-600' }}
              >
                <Radio
                  value="true"
                  classNames={{ label: 'text-sm text-bunker-800' }}
                >
                  Sim
                </Radio>
                <Radio
                  value="false"
                  classNames={{ label: 'text-sm text-bunker-800' }}
                >
                  Não
                </Radio>
              </RadioGroup>
            )}
          />
        </fieldset>
      )}

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
