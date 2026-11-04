import { getErrorMessage } from '@/services/api'
import {
  MeetingRepository,
  groupThemesByPhase,
} from '@/services/repositories/meetingRepository'
import { classroom, meeting, meetingTheme } from '@/Types'
import { fromCalendarDate, toCalendarDate, today } from '@/utils/date'
import { matchesSearch } from '@/utils/search'
import { SearchInput } from '@/components/SearchInput'
import { fieldsetClassName, legendClassName } from '@/components/tableStyles'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Checkbox,
  Chip,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react'
import { I18nProvider } from '@react-aria/i18n'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const meetingFormSchema = z.object({
  date: z.string({ message: 'Campo obrigatório' }).min(1, 'Campo obrigatório'),
  themeIds: z.array(z.string()).min(1, 'Escolha pelo menos um tema'),
  presentCatechizingIds: z.array(z.string()),
})

type MeetingFormData = z.infer<typeof meetingFormSchema>

interface MeetingModalProps {
  classroom: classroom
  // Temas ativos do itinerário da turma
  themes: meetingTheme[]
  // Temas já trabalhados em outros encontros da turma
  usedThemeIds: Set<string>
  data?: meeting
  onClose: () => void
  onSaved: () => void
}

// Cadastro e edição de um encontro com a chamada dos catequizandos
export function MeetingModal({
  classroom,
  themes,
  usedThemeIds,
  data,
  onClose,
  onSaved,
}: MeetingModalProps) {
  const catechizings = classroom.catechizings ?? []
  const [themeSearch, setThemeSearch] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      date: data?.date ?? today(),
      themeIds: data?.themes.map((theme) => theme.id) ?? [],
      presentCatechizingIds:
        data?.attendances
          .filter((attendance) => attendance.isPresent)
          .map((attendance) => attendance.catechizingId) ??
        // Encontro novo: todos começam desmarcados, marca-se quem está presente
        [],
    },
  })
  const selectedThemeIds = watch('themeIds')
  const presentCatechizingIds = watch('presentCatechizingIds')

  // Temas escolhidos, inclusive os que a coordenação já excluiu
  const allThemes = [
    ...themes,
    ...(data?.themes ?? []).filter(
      (theme) => !themes.some((item) => item.id === theme.id),
    ),
  ]
  const selectedThemes = selectedThemeIds
    .map((id) => allThemes.find((theme) => theme.id === id))
    .filter((theme): theme is meetingTheme => Boolean(theme))
    .sort((a, b) => a.position - b.position)

  const themeGroups = groupThemesByPhase(
    themes.filter(
      (theme) =>
        matchesSearch(theme.name, themeSearch) ||
        matchesSearch(theme.phase, themeSearch),
    ),
  )

  function toggleTheme(themeId: string, isSelected: boolean) {
    setValue(
      'themeIds',
      isSelected
        ? [...selectedThemeIds, themeId]
        : selectedThemeIds.filter((id) => id !== themeId),
      { shouldValidate: Boolean(errors.themeIds) },
    )
  }

  async function handleSubmitForm(form: MeetingFormData) {
    setSubmitError('')
    const request = {
      id: data?.id,
      classroomId: classroom.id!,
      date: form.date,
      themeIds: form.themeIds,
      attendances: [
        ...catechizings.map((catechizing) => ({
          catechizingId: catechizing.id!,
          isPresent: form.presentCatechizingIds.includes(catechizing.id!),
        })),
        // Mantém a presença de quem saiu da turma depois do encontro
        ...(data?.attendances ?? [])
          .filter(
            (attendance) =>
              !catechizings.some(
                (catechizing) => catechizing.id === attendance.catechizingId,
              ),
          )
          .map(({ catechizingId, isPresent }) => ({
            catechizingId,
            isPresent,
          })),
      ],
    }
    try {
      if (data?.id) {
        await MeetingRepository.updateMeeting(request)
      } else {
        await MeetingRepository.createMeeting(request)
      }
      onSaved()
      onClose()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="top"
      size="2xl"
      scrollBehavior="outside"
      className="py-2"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-0.5 text-xl font-semibold text-bunker-900">
          {data ? 'Editar chamada' : 'Nova chamada'}
          <span className="text-sm font-normal text-bunker-500">
            {classroom.name ?? classroom.location} · {classroom.segment}
          </span>
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="flex flex-col gap-4"
          >
            <I18nProvider locale="pt-BR">
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data do encontro"
                    value={toCalendarDate(field.value)}
                    onChange={(date) => field.onChange(fromCalendarDate(date))}
                    isInvalid={Boolean(errors.date)}
                    errorMessage={errors.date?.message}
                    showMonthAndYearPickers
                  />
                )}
              />
            </I18nProvider>

            <fieldset className={fieldsetClassName}>
              <legend className={legendClassName}>
                Temas do encontro ({selectedThemes.length} escolhido
                {selectedThemes.length === 1 ? '' : 's'})
              </legend>
              {selectedThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedThemes.map((theme) => (
                    <Chip
                      key={theme.id}
                      size="sm"
                      variant="flat"
                      color="primary"
                      onClose={() => toggleTheme(theme.id, false)}
                      classNames={{
                        base: 'h-auto max-w-full py-1',
                        content: 'whitespace-normal',
                      }}
                    >
                      {theme.name}
                    </Chip>
                  ))}
                </div>
              )}
              {errors.themeIds && (
                <p className="text-sm text-danger">{errors.themeIds.message}</p>
              )}
              {themes.length ? (
                <>
                  <SearchInput
                    value={themeSearch}
                    onChange={setThemeSearch}
                    placeholder="Pesquisar tema"
                  />
                  <div className="scrollbar-thin max-h-80 overflow-y-auto rounded-lg border border-bunker-200 bg-white px-3 py-2">
                    {themeGroups.length === 0 && (
                      <p className="py-2 text-sm text-bunker-400">
                        Nenhum tema encontrado
                      </p>
                    )}
                    {themeGroups.map((group) => (
                      <div key={group.phase} className="py-1.5">
                        <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-bunker-400">
                          {group.phase}
                        </p>
                        <div className="flex flex-col gap-1">
                          {group.themes.map((theme) => (
                            <Checkbox
                              key={theme.id}
                              isSelected={selectedThemeIds.includes(theme.id)}
                              onValueChange={(isSelected) =>
                                toggleTheme(theme.id, isSelected)
                              }
                              classNames={{
                                base: 'max-w-full items-start',
                                wrapper: 'mt-0.5',
                                label: 'text-sm text-bunker-800',
                              }}
                            >
                              {theme.name}
                              {usedThemeIds.has(theme.id) && (
                                <span className="ml-2 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                  já trabalhado
                                </span>
                              )}
                            </Checkbox>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-bunker-500">
                  Ainda não há temas para o itinerário desta turma. Peça à
                  coordenação para cadastrar.
                </p>
              )}
            </fieldset>

            <fieldset className={fieldsetClassName}>
              <legend className={legendClassName}>
                Chamada ({presentCatechizingIds.length} de {catechizings.length}{' '}
                presentes)
              </legend>
              {catechizings.length ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() =>
                        setValue(
                          'presentCatechizingIds',
                          catechizings.map((catechizing) => catechizing.id!),
                        )
                      }
                    >
                      Marcar todos
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => setValue('presentCatechizingIds', [])}
                    >
                      Desmarcar todos
                    </Button>
                  </div>
                  <Controller
                    name="presentCatechizingIds"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {catechizings.map((catechizing) => (
                          <Checkbox
                            key={catechizing.id}
                            isSelected={field.value.includes(catechizing.id!)}
                            onValueChange={(isPresent) =>
                              field.onChange(
                                isPresent
                                  ? [...field.value, catechizing.id!]
                                  : field.value.filter(
                                      (id) => id !== catechizing.id,
                                    ),
                              )
                            }
                            classNames={{ label: 'text-sm text-bunker-800' }}
                          >
                            {catechizing.name}
                          </Checkbox>
                        ))}
                      </div>
                    )}
                  />
                </>
              ) : (
                <p className="text-sm text-bunker-500">
                  A turma ainda não tem catequizandos.
                </p>
              )}
            </fieldset>

            {submitError && (
              <p className="text-sm text-danger">{submitError}</p>
            )}

            <Button
              type="submit"
              size="lg"
              color="primary"
              className="w-full font-medium"
              isLoading={isSubmitting}
            >
              Salvar chamada
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
