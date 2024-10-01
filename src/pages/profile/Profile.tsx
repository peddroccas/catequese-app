import {
  Button,
  Checkbox,
  CircularProgress,
  DatePicker,
  Input,
} from '@nextui-org/react'
import { CatechistActionTypes } from '@/reducer/catechist/catechistActionTypes'
import { I18nProvider } from '@react-aria/i18n'
import { Controller, useForm } from 'react-hook-form'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import {
  catechistInitialState,
  catechistReducer,
} from '@/reducer/catechist/catechistReducer'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useEffect, useReducer, useState } from 'react'
import { z } from 'zod'
import { parseAbsoluteToLocal } from '@internationalized/date'
import { useAuth } from '@/hooks/useAuth'

const editCatechistFormSchema = z.object({
  name: z
    .string({ message: 'Insira um valor válido' })
    .min(1, 'Campo obrigatoŕio'),
  nickname: z
    .string({ message: 'Insira um valor válido' })
    .min(1, 'Campo obrigatoŕio'),
  birthday: z.custom((value) => {
    if (value) {
      return true
    } else {
      return false
    }
  }, 'Campo obrigatório'),
  classroom: z.string().uuid().optional(),
  email: z
    .string({ message: 'Digite um email válido' })
    .email('Digite um email válido'),
})

export function Profile() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editCatechistFormSchema),
  })
  const { user } = useAuth()
  const { throwClassroomUpdate, throwCatechistUpdate } =
    useContext(ClassroomContext)
  const [state, dispatch] = useReducer(
    catechistReducer,
    user || catechistInitialState,
  )

  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  useEffect(() => {
    if (user.id) {
      dispatch({ type: CatechistActionTypes.SET_ALL, payload: user })
    }
  }, [user])

  async function handleSubmitEditCatechistForm() {
    setHasUserSubmittedForm(true)
    try {
      await CatechistRepository.updateCatechist(state)
        .then(() => {
          throwCatechistUpdate()
          throwClassroomUpdate()
        })
        .finally(() => {
          setHasUserSubmittedForm(false)
        })
    } catch (error) {
      console.error(error)
    }
  }

  if (!user) {
    return <></>
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-8 pb-8 pt-4">
      <form
        onSubmit={handleSubmit(handleSubmitEditCatechistForm)}
        className="flex flex-col gap-4 p-4"
      >
        <div className="flex gap-8">
          <Controller
            name="name"
            control={control}
            defaultValue={state.name}
            rules={{
              value: state.name,
              required: true,
              onChange: (e) =>
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
              onChange: (e) =>
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
        </div>
        <I18nProvider locale="pt-BR">
          <Controller
            name="birthday"
            control={control}
            defaultValue={parseAbsoluteToLocal(state.birthday!)}
            rules={{
              required: true,
              value: parseAbsoluteToLocal(state.birthday!),
              onChange: (e) =>
                dispatch({
                  type: CatechistActionTypes.SET_BIRTHDAY,
                  payload: { birthday: e.target.value.toAbsoluteString() },
                }),
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
        <div className="flex gap-8">
          <Controller
            name="email"
            defaultValue={state.email}
            control={control}
            rules={{
              value: state.email,
              required: true,
              onChange: (e) =>
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
            onChange={(e) =>
              dispatch({
                type: CatechistActionTypes.SET_PHONE,
                payload: { phone: e.target.value },
              })
            }
          />
        </div>
        <Input
          label="Endereço"
          value={state.address}
          onChange={(e) =>
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
          onChange={(e) => {
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
          onChange={(e) => {
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
          onChange={(e) => {
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
          onChange={(e) => {
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
    </div>
  )
}
