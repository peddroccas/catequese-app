import { ClassroomContext } from '@/contexts/ClassroomContext'
import { classroomRequest } from '@/services/repositories/classroomRepository'
import { classroom, segment, segments } from '@/Types'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  CircularProgress,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { requiredText } from '@/utils/validation'
import { WHATSAPP_GROUP_LINK } from '@/utils/whatsapp'

const currentYear = new Date().getFullYear()

function classroomFormSchema(minYear: number) {
  return z.object({
    location: requiredText(60),
    segment: z.enum(segments, { message: 'Campo obrigatório' }),
    startedAt: z.coerce
      .number({ message: 'Campo obrigatório' })
      .int('Ano inválido')
      .min(minYear, `O ano deve ser ${minYear} ou depois`)
      .max(currentYear + 1, `O ano deve ser no máximo ${currentYear + 1}`),
    catechistsId: z.array(z.string()),
    whatsappGroupLink: z
      .string()
      .trim()
      .refine((value) => !value || WHATSAPP_GROUP_LINK.test(value), {
        message:
          'Cole o link de convite do grupo (https://chat.whatsapp.com/...)',
      }),
  })
}

type ClassroomFormData = z.infer<ReturnType<typeof classroomFormSchema>>

interface ClassroomFormProps {
  data?: classroom
  submitLabel: string
  onSubmit: (classroom: classroomRequest) => Promise<void>
}

export function ClassroomForm({
  data,
  submitLabel,
  onSubmit,
}: ClassroomFormProps) {
  const { catechists } = useContext(ClassroomContext)
  // Turma nova começa no ano atual; turmas antigas continuam editáveis
  const minYear = data ? 2023 : currentYear
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomFormSchema(minYear)),
    defaultValues: {
      location: data?.location ?? '',
      segment: data?.segment,
      startedAt: data?.startedAt ?? currentYear,
      catechistsId: data?.catechists?.map((catechist) => catechist.id) ?? [],
      whatsappGroupLink: data?.whatsappGroupLink ?? '',
    },
  })
  const [submitError, setSubmitError] = useState<string>('')

  async function handleSubmitForm(form: ClassroomFormData) {
    setSubmitError('')
    try {
      await onSubmit({ id: data?.id, ...form })
    } catch (error) {
      setSubmitError(String(error instanceof Error ? error.message : error))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-col gap-4"
    >
      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <Input
            label="Local"
            description="Ex.: Sala 3, Auditório, Capela"
            {...field}
            isInvalid={Boolean(errors.location)}
            errorMessage={errors.location?.message}
          />
        )}
      />

      <Controller
        name="segment"
        control={control}
        render={({ field }) => (
          <Select
            label="Segmento"
            classNames={{
              listbox: 'text-bunker-800',
              selectorIcon: 'text-bunker-500',
            }}
            selectedKeys={field.value ? [field.value] : []}
            onChange={(e) => field.onChange(e.target.value as segment)}
            isInvalid={Boolean(errors.segment)}
            errorMessage={errors.segment?.message}
          >
            {segments.map((segment) => (
              <SelectItem key={segment}>{segment}</SelectItem>
            ))}
          </Select>
        )}
      />

      <Controller
        name="startedAt"
        control={control}
        render={({ field }) => (
          <Input
            label="Ano de início"
            type="number"
            value={String(field.value ?? '')}
            onChange={field.onChange}
            isInvalid={Boolean(errors.startedAt)}
            errorMessage={errors.startedAt?.message}
          />
        )}
      />

      <Controller
        name="catechistsId"
        control={control}
        render={({ field }) => (
          <Select
            label="Catequistas"
            description="Opcional; um catequista pode estar em várias turmas"
            selectionMode="multiple"
            isMultiline
            classNames={{
              listbox: 'text-bunker-800',
              selectorIcon: 'text-bunker-500',
            }}
            selectedKeys={field.value}
            onSelectionChange={(keys) =>
              field.onChange(Array.from(keys).map(String))
            }
          >
            {catechists.map((catechist) => (
              <SelectItem key={catechist.id!}>{catechist.name}</SelectItem>
            ))}
          </Select>
        )}
      />

      <Controller
        name="whatsappGroupLink"
        control={control}
        render={({ field }) => (
          <Input
            label="Link do grupo do WhatsApp"
            placeholder="https://chat.whatsapp.com/..."
            description="No grupo: toque no nome → Convidar via link → Copiar link"
            {...field}
            isInvalid={Boolean(errors.whatsappGroupLink)}
            errorMessage={errors.whatsappGroupLink?.message}
          />
        )}
      />

      {submitError && <p className="text-sm text-danger">{submitError}</p>}

      <Button
        color="primary"
        className="w-full font-medium"
        type="submit"
        size="lg"
        isDisabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size="sm" /> : submitLabel}
      </Button>
    </form>
  )
}
