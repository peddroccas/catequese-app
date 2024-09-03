import { ClassroomSelect } from '@/components/ClassroomSelect'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechizingActionTypes } from '@/reducer/catechizing/catechizingActionTypes'
import {
  catechizingReducer,
  catechizingInitialState,
} from '@/reducer/catechizing/catechizingReducer'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Input,
  DatePicker,
  Checkbox,
  Button,
  CircularProgress,
} from '@nextui-org/react'
import { I18nProvider } from '@react-aria/i18n'
import { useContext, useReducer, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const addNewCatechizingFormSchema = z.object({
  name: z.string().min(1, 'Campo obrigatoŕio'),
  birthday: z.custom((value) => {
    if (value) {
      return true
    } else {
      return false
    }
  }, 'Campo obrigatório'),
  classroom: z.string(),
})

export function AddNewCatechizingForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addNewCatechizingFormSchema),
  })
  const { classrooms } = useContext(ClassroomContext)
  const [state, dispatch] = useReducer(
    catechizingReducer,
    catechizingInitialState,
  )
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

  async function handleSubmitNewCatechizingForm() {
    setHasUserSubmittedForm(true)

    try {
      await CatechizingRepository.createNewCatechizing(state).finally(() =>
        setHasUserSubmittedForm(false),
      )
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-bunker-900">
      <form
        onSubmit={handleSubmit(handleSubmitNewCatechizingForm)}
        className="flex flex-col gap-4"
      >
        <Controller
          name="name"
          control={control}
          rules={{
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
              isRequired
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
                  type: CatechizingActionTypes.SET_BIRTHDAY,
                  payload: { birthday: e.target.value },
                }),
            }}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Data"
                // validationBehavior="native"
                // validate={(value) => {
                //   const birthday = register('birthday', { value, required: true })
                //   console.log(bir)
                //   if (birthday) {
                //     return true
                //   }
                // }}
                isRequired
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
          label="Endereço"
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
          checked={state.hasReceivedBaptism}
          classNames={{ label: 'text-white' }}
          onChange={(e) => {
            console.log(e)
            dispatch({
              type: CatechizingActionTypes.SET_HAS_RECEIVED_BAPTISM,
              payload: { personWithSpecialNeeds: e.target.checked },
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
            console.log(e)
            dispatch({
              type: CatechizingActionTypes.SET_HAS_RECEIVED_EUCHARIST,
              payload: { personWithSpecialNeeds: e.target.checked },
            })
          }}
        >
          1° Eucaristia
        </Checkbox>
        <Checkbox
          value="Sacramento do Matrimônio"
          checked={state.hasReceivedMarriage}
          classNames={{ label: 'text-white' }}
          onChange={(e) => {
            console.log(e)
            dispatch({
              type: CatechizingActionTypes.SET_HAS_RECEIVED_MARRIAGE,
              payload: { personWithSpecialNeeds: e.target.checked },
            })
          }}
        >
          Sacramento do Matrimônio
        </Checkbox>
        <Checkbox
          value="Pessoa com necessidade especial"
          checked={state.personWithSpecialNeeds}
          classNames={{ label: 'text-white' }}
          onChange={(e) => {
            console.log(e)
            dispatch({
              type: CatechizingActionTypes.SET_PERSON_WITH_SPECIAL_NEEDS,
              payload: { personWithSpecialNeeds: e.target.checked },
            })
          }}
        >
          Pessoa com Necessidade Especial
        </Checkbox>

        <ClassroomSelect
          value={selectedClassroom!}
          props={{
            id: 'classroom',
            isInvalid: Boolean(errors.classroom),
            errorMessage: String(errors.classroom?.message),
            children: <></>,
            ...register('classroom'),
          }}
          onChange={(e) => {
            setSelectedClassroom(
              classrooms.find((classroom) => classroom.id === e.target.value)!,
            )
            dispatch({
              type: CatechizingActionTypes.SET_CATECHIZING_TO_CLASSROOM,
              payload: { catechizing_id: e.target.value },
            })
          }}
        />
        <Button
          variant="solid"
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
