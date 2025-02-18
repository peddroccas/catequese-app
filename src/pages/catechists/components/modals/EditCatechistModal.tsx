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
} from '@heroui/react'
import { CatechistActionTypes } from '@/reducer/catechist/catechistActionTypes'
import { I18nProvider } from '@react-aria/i18n'
import { Controller, useForm } from 'react-hook-form'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { catechistReducer } from '@/reducer/catechist/catechistReducer'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useReducer, useState } from 'react'
import { z } from 'zod'
import { parseAbsoluteToLocal, parseDate } from '@internationalized/date'
import type { catechist } from '@/Types'

const editCatechistFormSchema = z.object({
  name: z
    .string({ message: 'Insira um valor válido' })
    .min(1, 'Campo obrigatoŕio'),
  nickname: z
    .string({ message: 'Insira um valor válido' })
    .min(1, 'Campo obrigatoŕio'),
  birthday: z.custom(value => {
    if (value) {
      return true
    }
    return false
  }, 'Campo obrigatório'),
  classroom: z.string().uuid().optional(),
  email: z
    .string({ message: 'Digite um email válido' })
    .email('Digite um email válido'),
})

interface EditCatechistFormModal {
  data: catechist
  isOpen: boolean
  onClose: () => void
}

export function EditCatechistModal({
  isOpen,
  onClose,
  data,
}: EditCatechistFormModal) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editCatechistFormSchema),
  })
  const { classrooms, throwClassroomUpdate, throwCatechistUpdate } =
    useContext(ClassroomContext)
  const [state, dispatch] = useReducer(catechistReducer, data)

  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handleSubmitNewCatechistForm() {
    setHasUserSubmittedForm(true)
    try {
      // console.log(state)
      await CatechistRepository.updateCatechist(state)
        .then(() => {
          throwCatechistUpdate()
          throwClassroomUpdate()
        })
        .finally(() => {
          setHasUserSubmittedForm(false)
          onClose()
        })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      scrollBehavior="outside"
      className="flex w-9/12 flex-col rounded-xl bg-bunker-900 py-2 md:w-5/12 lg:w-3/12 2xl:w-3/12"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          Editar Catequista
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitNewCatechistForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="name"
              control={control}
              defaultValue={state.name}
              rules={{
                value: state.name,
                required: true,
                onChange: e =>
                  dispatch({
                    type: CatechistActionTypes.SET_NAME,
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
            <Controller
              name="nickname"
              control={control}
              defaultValue={state.nickname}
              rules={{
                value: state.nickname,
                required: true,
                onChange: e =>
                  dispatch({
                    type: CatechistActionTypes.SET_NICKNAME,
                    payload: { nickname: e.target.value },
                  }),
              }}
              render={({ field }) => (
                <Input
                  label="Apelido"
                  {...field}
                  isInvalid={Boolean(errors.nickname)}
                  errorMessage={String(errors.nickname?.message)}
                />
              )}
            />

            <I18nProvider locale="pt-BR">
              <Controller
                name="birthday"
                control={control}
                defaultValue={parseDate(state.birthday!)}
                rules={{
                  required: true,
                  value: parseDate(state.birthday!),
                  onChange: e => {
                    const date = new Date(e.target.value.toDate())
                    console.log(date.toISOString())
                    dispatch({
                      type: CatechistActionTypes.SET_BIRTHDAY,
                      payload: { birthday: date.toISOString() },
                    })
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Data de Nascimento"
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
            <Controller
              name="email"
              defaultValue={state.email}
              control={control}
              rules={{
                value: state.email,
                required: true,
                onChange: e =>
                  dispatch({
                    type: CatechistActionTypes.SET_EMAIL,
                    payload: { email: e.target.value },
                  }),
              }}
              render={({ field }) => (
                <Input
                  label="Email"
                  {...field}
                  isInvalid={Boolean(errors.email)}
                  errorMessage={String(errors.email?.message)}
                />
              )}
            />
            <Input
              label="Telefone"
              value={state.phone}
              onChange={e =>
                dispatch({
                  type: CatechistActionTypes.SET_PHONE,
                  payload: { phone: e.target.value },
                })
              }
            />
            <Input
              label="Endereço"
              value={state.address}
              onChange={e =>
                dispatch({
                  type: CatechistActionTypes.SET_ADDRESS,
                  payload: { address: e.target.value },
                })
              }
            />
            <Checkbox
              value="Batismo"
              isSelected={state.hasReceivedBaptism}
              classNames={{ label: 'text-white' }}
              onChange={e => {
                dispatch({
                  type: CatechistActionTypes.SET_HAS_RECEIVED_BAPTISM,
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
              onChange={e => {
                dispatch({
                  type: CatechistActionTypes.SET_HAS_RECEIVED_EUCHARIST,
                  payload: { hasReceivedEucharist: e.target.checked },
                })
              }}
            >
              1° Eucaristia
            </Checkbox>
            <Checkbox
              value="Crisma"
              isSelected={state.hasReceivedConfirmation}
              classNames={{ label: 'text-white' }}
              onChange={e => {
                dispatch({
                  type: CatechistActionTypes.SET_HAS_RECEIVED_CONFIRMATION,
                  payload: { hasReceivedConfirmation: e.target.checked },
                })
              }}
            >
              Crisma
            </Checkbox>

            <Checkbox
              value="Sacramento do Matrimônio"
              isSelected={state.hasReceivedMarriage}
              classNames={{ label: 'text-white' }}
              onChange={e => {
                dispatch({
                  type: CatechistActionTypes.SET_HAS_RECEIVED_MARRIAGE,
                  payload: { hasReceivedMarriage: e.target.checked },
                })
              }}
            >
              Sacramento do Matrimônio
            </Checkbox>

            <Button
              variant="solid"
              aria-labelledby="cadastro de catequizando"
              aria-label="cadastro de catequizando"
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
