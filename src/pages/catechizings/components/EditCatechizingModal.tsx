import {
  Button,
  Checkbox,
  CircularProgress,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechizingActionTypes } from '@/reducer/catechizing/catechizingActionTypes'
import { catechizingReducer } from '@/reducer/catechizing/catechizingReducer'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { zodResolver } from '@hookform/resolvers/zod'
import { I18nProvider } from '@react-aria/i18n'
import { useContext, useReducer, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { catechizing } from '@/Types'
import { parseAbsoluteToLocal } from '@internationalized/date'

const EditCatechizingFormSchema = z.object({
  name: z
    .string({ message: 'Insira um valor válido' })
    .min(1, 'Campo obrigatoŕio'),
  birthday: z.custom((value) => {
    if (value) {
      return true
    } else {
      return false
    }
  }, 'Campo obrigatório'),
})

interface EditCatechizingFormProps {
  data: catechizing
  isOpen: boolean
  onClose: () => void
}

export function EditCatechizingModal({
  data,
  isOpen,
  onClose,
}: EditCatechizingFormProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EditCatechizingFormSchema),
  })
  const { classrooms, throwClassroomUpdate } = useContext(ClassroomContext)
  const [state, dispatch] = useReducer(catechizingReducer, data)

  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handleSubmitEditCatechizingForm() {
    setHasUserSubmittedForm(true)
    try {
      await CatechizingRepository.updateCatechizing(state)
        .finally(() => {
          setHasUserSubmittedForm(false)
          // reset()
          onClose()
        })
        .then(throwClassroomUpdate)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="flex w-9/12 flex-col rounded-xl bg-bunker-900 py-4 md:w-5/12 lg:w-3/12 2xl:w-3/12"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          Editar Catequizando
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitEditCatechizingForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="name"
              control={control}
              defaultValue={state.name}
              rules={{
                value: state.name,
                required: true,
                onChange: (e) =>
                  dispatch({
                    type: CatechizingActionTypes.SET_NAME,
                    payload: { name: e.target.value },
                  }),
              }}
              render={({ field }) => (
                <Input
                  label="Nome"
                  {...field}
                  isInvalid={Boolean(errors.name)}
                  errorMessage={String(errors.name?.message)}
                />
              )}
            />

            <I18nProvider locale="pt-BR">
              <Controller
                name="birthday"
                defaultValue={parseAbsoluteToLocal(state.birthday!)}
                control={control}
                rules={{
                  required: true,
                  value: parseAbsoluteToLocal(state.birthday!),
                  onChange: (e) => {
                    dispatch({
                      type: CatechizingActionTypes.SET_BIRTHDAY,
                      payload: { birthday: e.target.value.toAbsoluteString() },
                    })
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Data"
                    isInvalid={Boolean(errors.birthday)}
                    errorMessage={String(errors.birthday?.message)}
                    dateInputClassNames={{
                      inputWrapper: 'border hover:border-2 focus:border-2',
                    }}
                    classNames={{ input: '!text-brown-500' }}
                    showMonthAndYearPickers
                    granularity="day"
                  />
                )}
              />
            </I18nProvider>
            <Input
              label="Endereço"
              defaultValue={state.address}
              value={state.address}
              onChange={(e) =>
                dispatch({
                  type: CatechizingActionTypes.SET_ADDRESS,
                  payload: { address: e.target.value },
                })
              }
            />
            <Checkbox
              value="Batismo"
              isSelected={state.hasReceivedBaptism}
              classNames={{ label: 'text-white' }}
              onChange={(e) => {
                dispatch({
                  type: CatechizingActionTypes.SET_HAS_RECEIVED_BAPTISM,
                  payload: { hasReceivedBaptism: e.target.checked },
                })
              }}
            >
              Batismo
            </Checkbox>
            <Checkbox
              value="1° Eucaristia"
              isSelected={state.hasReceivedEucharist}
              classNames={{ label: 'text-white' }}
              onChange={(e) => {
                dispatch({
                  type: CatechizingActionTypes.SET_HAS_RECEIVED_EUCHARIST,
                  payload: { hasReceivedEucharist: e.target.checked },
                })
              }}
            >
              1° Eucaristia
            </Checkbox>
            <Checkbox
              value="Sacramento do Matrimônio"
              isSelected={state.hasReceivedMarriage}
              classNames={{ label: 'text-white' }}
              onChange={(e) => {
                dispatch({
                  type: CatechizingActionTypes.SET_HAS_RECEIVED_MARRIAGE,
                  payload: { hasReceivedMarriage: e.target.checked },
                })
              }}
            >
              Sacramento do Matrimônio
            </Checkbox>
            <Checkbox
              value="Pessoa com necessidade especial"
              isSelected={state.personWithSpecialNeeds}
              classNames={{ label: 'text-white' }}
              onChange={(e) => {
                dispatch({
                  type: CatechizingActionTypes.SET_PERSON_WITH_SPECIAL_NEEDS,
                  payload: { personWithSpecialNeeds: e.target.checked },
                })
              }}
            >
              Pessoa com Necessidade Especial
            </Checkbox>

            <Button
              variant="solid"
              aria-labelledby="edição de catequizando"
              aria-label="edição de catequizando"
              className="w-full p-2 font-medium shadow shadow-black"
              type="submit"
              size="lg"
            >
              {hasUserSubmittedForm ? <CircularProgress /> : 'Salvar'}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
