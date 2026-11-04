import { getErrorMessage } from '@/services/api'
import { MeetingRepository } from '@/services/repositories/meetingRepository'
import { itinerary, meetingTheme } from '@/Types'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
} from '@nextui-org/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const themeFormSchema = z.object({
  phase: z.string().trim().min(1, 'Campo obrigatório'),
  name: z.string().trim().min(1, 'Campo obrigatório'),
})

type ThemeFormData = z.infer<typeof themeFormSchema>

interface MeetingThemeModalProps {
  itinerary: itinerary
  // Fases já usadas no itinerário, para escolher ou criar uma nova
  phases: string[]
  data?: meetingTheme
  defaultPhase?: string
  onClose: () => void
  onSaved: () => void
}

export function MeetingThemeModal({
  itinerary,
  phases,
  data,
  defaultPhase,
  onClose,
  onSaved,
}: MeetingThemeModalProps) {
  const [submitError, setSubmitError] = useState<string>('')
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      phase: data?.phase ?? defaultPhase ?? phases.at(-1) ?? '',
      name: data?.name ?? '',
    },
  })

  async function handleSubmitForm(form: ThemeFormData) {
    setSubmitError('')
    try {
      if (data) {
        await MeetingRepository.updateTheme({ id: data.id, itinerary, ...form })
      } else {
        await MeetingRepository.createTheme({ itinerary, ...form })
      }
      onSaved()
      onClose()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  return (
    <Modal isOpen onClose={onClose} placement="top" size="xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-0.5 text-xl font-semibold text-bunker-900">
          {data ? 'Editar tema' : 'Novo tema'}
          <span className="text-sm font-normal text-bunker-500">
            Itinerário: {itinerary}
          </span>
        </ModalHeader>
        <ModalBody className="pb-6">
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="phase"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  label="Tempo / fase"
                  description="Escolha uma fase existente ou digite uma nova"
                  allowsCustomValue
                  inputValue={field.value}
                  onInputChange={field.onChange}
                  onSelectionChange={(key) =>
                    key && field.onChange(String(key))
                  }
                  isInvalid={Boolean(errors.phase)}
                  errorMessage={errors.phase?.message}
                  defaultItems={phases.map((phase) => ({ phase }))}
                >
                  {(item) => (
                    <AutocompleteItem key={item.phase}>
                      {item.phase}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Tema"
                  minRows={2}
                  {...field}
                  isInvalid={Boolean(errors.name)}
                  errorMessage={errors.name?.message}
                />
              )}
            />
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
              Salvar
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
