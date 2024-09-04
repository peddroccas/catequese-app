import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechistActionTypes } from '@/reducer/catechist/catechistActionTypes'
import {
  catechistInitialState,
  catechistReducer,
} from '@/reducer/catechist/catechistReducer'
import { CatechistRepository } from '@/services/repositories/catechistRepository'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Input,
  DatePicker,
  Checkbox,
  Button,
  CircularProgress,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { I18nProvider } from '@react-aria/i18n'
import { useContext, useReducer, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const addNewCatechistFormSchema = z.object({
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
  classroom: z
    .string({ message: 'Campo obrigatório' })
    .uuid({ message: 'Campo obrigatório' }),
})

export function AddNewCatechistForm() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addNewCatechistFormSchema),
  })
  const { classrooms, throwClassroomUpdate } = useContext(ClassroomContext)
  const [state, dispatch] = useReducer(catechistReducer, catechistInitialState)
  const [selectedClassroom, setSelectedClassroom] = useState<{
    id: string
    classroomName: string
  }>(
    {} as {
      id: string
      classroomName: string
    },
  )

  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handleSubmitNewCatechistForm() {
    setHasUserSubmittedForm(true)
    console.log(state)
    try {
      await CatechistRepository.createNewCatechist(state)
        .finally(() => {
          setHasUserSubmittedForm(false)
          // dispatch({ type: CatechistActionTypes.RESET })
        })
        .then(throwClassroomUpdate)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-bunker-900">
      <form
        onSubmit={handleSubmit(handleSubmitNewCatechistForm)}
        className="flex flex-col gap-4"
      >
        <Controller
          name="name"
          control={control}
          rules={{
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

        <I18nProvider locale="pt-BR">
          <Controller
            name="birthday"
            control={control}
            rules={{
              required: true,
              value: state.birthday,
              onChange: (e) =>
                dispatch({
                  type: CatechistActionTypes.SET_BIRTHDAY,
                  payload: { birthday: e.target.value },
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
              />
            )}
          />
        </I18nProvider>
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
          checked={state.hasReceivedBaptism}
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
          checked={state.hasReceivedEucharist}
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
          checked={state.hasReceivedConfirmation}
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
          checked={state.hasReceivedMarriage}
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
        <Controller
          name="classroom"
          control={control}
          rules={{
            required: true,
            value: selectedClassroom!,
            onChange: (e) => {
              setSelectedClassroom(
                classrooms.find(
                  (classroom) => classroom.id === e.target.value,
                )!,
              )
              dispatch({
                type: CatechistActionTypes.SET_CATECHIST_TO_CLASSROOM,
                payload: { classroomId: e.target.value },
              })
            },
          }}
          render={({ field }) => (
            <Select
              {...field}
              label="Turma"
              size="md"
              className="max-w-prose"
              classNames={{ listbox: '!text-bunker-950' }}
              selectedKeys={[field.value]}
              isInvalid={Boolean(errors.classroom)}
              errorMessage={String(errors.classroom?.message)}
            >
              {classrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.classroomName}>
                  {classroom.classroomName}
                </SelectItem>
              ))}
            </Select>
          )}
        />

        <Button
          variant="solid"
          aria-labelledby="cadastro de catequizando"
          aria-label="cadastro de catequizando"
          className="w-full p-2 font-medium shadow shadow-black"
          type="submit"
          size="lg"
        >
          {hasUserSubmittedForm ? <CircularProgress /> : 'Cadastrar'}
        </Button>
      </form>
    </div>
  )
}
