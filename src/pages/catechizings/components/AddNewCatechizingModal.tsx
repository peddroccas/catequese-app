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
  Select,
  SelectItem,
} from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechizingActionTypes } from '@/reducer/catechizing/catechizingActionTypes'
import {
  catechizingReducer,
  catechizingInitialState,
} from '@/reducer/catechizing/catechizingReducer'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { zodResolver } from '@hookform/resolvers/zod'
import { I18nProvider } from '@react-aria/i18n'
import { useContext, useEffect, useReducer, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'

const addNewCatechizingFormSchema = z.object({
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

interface AddNewCatechizingFormProps {
  isOpen: boolean
  onClose: () => void
  classroomId?: string
}

export function AddNewCatechizingModal({
  isOpen,
  onClose,
  classroomId,
}: AddNewCatechizingFormProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addNewCatechizingFormSchema),
  })
  const { classrooms, throwClassroomUpdate } = useContext(ClassroomContext)
  const [state, dispatch] = useReducer(
    catechizingReducer,
    catechizingInitialState,
  )
  const [selectedClassroom, setSelectedClassroom] = useState<{
    id: string
    classroomName: string
    startedAt: number
  }>()

  useEffect(() => {
    setSelectedClassroom(
      classrooms.find((classroom) => classroom.id === classroomId)!,
    )
  }, [classrooms, classroomId])

  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handleSubmitNewCatechizingForm() {
    setHasUserSubmittedForm(true)
    try {
      await CatechizingRepository.createNewCatechizing(state)
        .finally(() => {
          setHasUserSubmittedForm(false)
          dispatch({ type: CatechizingActionTypes.RESET })
          setSelectedClassroom(
            {} as {
              id: string
              classroomName: string
              startedAt: number
            },
          )
          reset()
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
          Adicionar Novo Catequizando
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitNewCatechizingForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="name"
              control={control}
              rules={{
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
                defaultValue={undefined}
                control={control}
                rules={{
                  required: true,
                  value: state.birthday,
                  onChange: (e) => {
                    console.log(e.target.value)
                    dispatch({
                      type: CatechizingActionTypes.SET_BIRTHDAY,
                      payload: { birthday: e.target.value.toString() },
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
              checked={state.hasReceivedEucharist}
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
              checked={state.hasReceivedMarriage}
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
              checked={state.personWithSpecialNeeds}
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
                    type: CatechizingActionTypes.SET_CATECHIZING_TO_CLASSROOM,
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
                  classNames={{
                    listbox: '!text-bunker-950',
                    selectorIcon: 'text-bunker-950',
                  }}
                  selectedKeys={[
                    classroomId ? selectedClassroom!.id : field.value,
                  ]}
                  isInvalid={Boolean(errors.classroom)}
                  errorMessage={String(errors.classroom?.message)}
                >
                  {classrooms.map((classroom) => (
                    <SelectItem
                      key={classroom.id}
                      value={classroom.classroomName}
                    >
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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
