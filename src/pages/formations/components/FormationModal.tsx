import { ClassroomContext } from '@/contexts/ClassroomContext'
import { getErrorMessage } from '@/services/api'
import { FormationRepository } from '@/services/repositories/formationRepository'
import { formation } from '@/Types'
import { fromCalendarDate, toCalendarDate, today } from '@/utils/date'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react'
import { I18nProvider } from '@react-aria/i18n'
import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const formationFormSchema = z.object({
  theme: z.string().trim().min(1, 'Campo obrigatório'),
  date: z.string({ message: 'Campo obrigatório' }).min(1, 'Campo obrigatório'),
  presentCatechistIds: z.array(z.string()),
})

type FormationFormData = z.infer<typeof formationFormSchema>

interface FormationModalProps {
  data?: formation
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

// Cadastro e edição de formação com a lista de chamada dos catequistas
export function FormationModal({
  data,
  isOpen,
  onClose,
  onSaved,
}: FormationModalProps) {
  const { catechists } = useContext(ClassroomContext)
  const [submitError, setSubmitError] = useState<string>('')
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormationFormData>({
    resolver: zodResolver(formationFormSchema),
    defaultValues: {
      theme: data?.theme ?? '',
      date: data?.date ?? today(),
      presentCatechistIds:
        data?.attendances
          .filter((attendance) => attendance.isPresent)
          .map((attendance) => attendance.catechistId) ?? [],
    },
  })
  const presentCatechistIds = watch('presentCatechistIds')

  async function handleSubmitForm(form: FormationFormData) {
    setSubmitError('')
    const formation: formation = {
      id: data?.id,
      theme: form.theme,
      date: form.date,
      attendances: catechists.map((catechist) => ({
        catechistId: catechist.id!,
        isPresent: form.presentCatechistIds.includes(catechist.id!),
      })),
    }
    try {
      if (data?.id) {
        await FormationRepository.updateFormation(formation)
      } else {
        await FormationRepository.createNewFormation(formation)
      }
      onSaved()
      onClose()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top"
      size="2xl"
      scrollBehavior="outside"
      className="rounded-xl bg-bunker-900 py-4"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          {data ? 'Editar formação' : 'Nova formação'}
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <Input
                  label="Tema da formação"
                  {...field}
                  isInvalid={Boolean(errors.theme)}
                  errorMessage={errors.theme?.message}
                />
              )}
            />
            <I18nProvider locale="pt-BR">
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data"
                    value={toCalendarDate(field.value)}
                    onChange={(date) => field.onChange(fromCalendarDate(date))}
                    isInvalid={Boolean(errors.date)}
                    errorMessage={errors.date?.message}
                    showMonthAndYearPickers
                  />
                )}
              />
            </I18nProvider>

            <fieldset className="flex flex-col gap-2 rounded-xl border border-bunker-700 p-3">
              <legend className="px-1 text-sm text-bunker-300">
                Chamada ({presentCatechistIds.length} de {catechists.length}{' '}
                presentes)
              </legend>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  className="text-white"
                  onPress={() =>
                    setValue(
                      'presentCatechistIds',
                      catechists.map((catechist) => catechist.id!),
                    )
                  }
                >
                  Marcar todos
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  className="text-white"
                  onPress={() => setValue('presentCatechistIds', [])}
                >
                  Desmarcar todos
                </Button>
              </div>
              <Controller
                name="presentCatechistIds"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {catechists.map((catechist) => (
                      <Checkbox
                        key={catechist.id}
                        isSelected={field.value.includes(catechist.id!)}
                        onValueChange={(isPresent) =>
                          field.onChange(
                            isPresent
                              ? [...field.value, catechist.id!]
                              : field.value.filter((id) => id !== catechist.id),
                          )
                        }
                        classNames={{ label: 'text-white' }}
                      >
                        {catechist.name}
                      </Checkbox>
                    ))}
                  </div>
                )}
              />
            </fieldset>

            {submitError && (
              <p className="text-sm text-danger">{submitError}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full font-medium shadow shadow-black"
              isLoading={isSubmitting}
            >
              Salvar
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
