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
} from '@heroui/react'
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
import { classroom } from '@/Types'
import {
  parentInitialState,
  parentReducer,
} from '@/reducer/parent/parentReducer'
import { ParentActionTypes } from '@/reducer/parent/ParentActionTypes'

const addNewCatechizingFormSchema = z.object({
  name: z
    .string({ message: 'Insira um valor válido' })
    .min(1, 'Campo obrigatoŕio'),
  birthday: z.custom(value => {
    if (value) {
      return true
    } else {
      return false
    }
  }, 'Campo obrigatório'),
  classroom: z.custom(value => {
    if (value) {
      return true
    } else {
      return false
    }
  }, 'Campo obrigatório'),
  responsibleName: z
    .string({ message: 'Insira um valor válido' })
    .min(1, 'Campo obrigatoŕio'),
  responsiblePhone: z.string({ message: 'Insira um valor válido' }),
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
    catechizingInitialState
  )
  const [parent, parentDispatch] = useReducer(parentReducer, parentInitialState)
  const [selectedClassroom, setSelectedClassroom] = useState<classroom>()

  useEffect(() => {
    setSelectedClassroom(
      classrooms.find(classroom => classroom.id === classroomId)!
    )
    dispatch({
      type: CatechizingActionTypes.SET_CATECHIZING_TO_CLASSROOM,
      payload: { classroomId },
    })
  }, [classrooms, classroomId])

  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handleSubmitNewCatechizingForm() {
    setHasUserSubmittedForm(true)
    try {
      await CatechizingRepository.createNewCatechizing({
        ...state,
        parents: parent,
      })
        .finally(() => {
          setHasUserSubmittedForm(false)
          dispatch({ type: CatechizingActionTypes.RESET })
          parentDispatch({ type: ParentActionTypes.RESET })
          setSelectedClassroom({} as classroom)
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
      placement="top"
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
                onChange: e =>
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
                  onChange: e => {
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
              onChange={e =>
                dispatch({
                  type: CatechizingActionTypes.SET_ADDRESS,
                  payload: { address: e.target.value },
                })
              }
            />
            <Controller
              name="responsibleName"
              control={control}
              rules={{
                value: parent?.name,
                required: true,
                onChange: e =>
                  parentDispatch({
                    type: ParentActionTypes.SET_NAME,
                    payload: { name: e.target.value },
                  }),
              }}
              render={({ field }) => (
                <Input
                  label="Nome do responsável"
                  {...field}
                  isInvalid={Boolean(errors.responsibleName)}
                  errorMessage={String(errors.responsibleName?.message)}
                />
              )}
            />
            <Controller
              name="responsiblePhone"
              control={control}
              rules={{
                value: parent?.phone,
                required: true,
                onChange: e =>
                  parentDispatch({
                    type: ParentActionTypes.SET_PHONE,
                    payload: { phone: e.target.value },
                  }),
              }}
              render={({ field }) => (
                <Input
                  label="Telefone do responsável"
                  {...field}
                  isInvalid={Boolean(errors.responsiblePhone)}
                  errorMessage={String(errors.responsiblePhone?.message)}
                />
              )}
            />

            <Input
              label="Parentesco"
              value={parent.kinship}
              onChange={e =>
                parentDispatch({
                  type: ParentActionTypes.SET_KINSHIP,
                  payload: { kinship: e.target.value },
                })
              }
            />
            <Checkbox
              value="Batismo"
              checked={state.hasReceivedBaptism}
              classNames={{ label: 'text-white' }}
              onChange={e => {
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
              onChange={e => {
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
              onChange={e => {
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
              onChange={e => {
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
              defaultValue={selectedClassroom}
              rules={{
                required: true,
                value: selectedClassroom!,
                onChange: e => {
                  setSelectedClassroom(
                    classrooms.find(
                      classroom => classroom.id === e.target.value
                    )!
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
                  {classrooms.map(classroom => (
                    <SelectItem key={classroom.id!} value={classroom.name}>
                      {classroom.name}
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
