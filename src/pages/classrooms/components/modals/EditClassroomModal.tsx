import {
  Button,
  CircularProgress,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ClassroomActionTypes } from '@/reducer/classroom/classroomActionTypes'
import {
  classroomReducer,
  classroomInitialState,
} from '@/reducer/classroom/classroomReducer'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { catechist, classroom, years } from '@/Types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useEffect, useReducer, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'

const EditClassroomFormSchema = z.object({
  roomNumber: z.coerce
    .number({ message: 'Campo obrigatório' })
    .min(1, 'Campo inválido')
    .max(20, 'Número máximo: 20'),
  segment: z.enum(
    [
      '1° Eucaristia',
      'Crisma',
      'Catequizandos Adultos',
      'Catecúmenos Adultos',
      'Sementinha',
      'Pré-Eucaristia',
    ],
    { message: 'Campo obrigatório' },
  ),
  startedAt: z.coerce
    .number()
    .min(2023, {
      message: 'Digite um dos anos 2023, 2024, 2025',
    })
    .max(2025, {
      message: 'Digite um dos anos 2023, 2024, 2025',
    }),
  catechists: z.custom((value) => {
    if (value) {
      return true
    } else {
      return false
    }
  }, 'Campo obrigatório'),
})

interface EditCatechistFormProps {
  isOpen: boolean
  onClose: () => void
  data: classroom
}

export function EditClassroomModal({
  isOpen,
  onClose,
  data,
}: EditCatechistFormProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EditClassroomFormSchema),
  })
  const { catechists, throwClassroomUpdate, throwCatechistUpdate } =
    useContext(ClassroomContext)
  const [state, dispatch] = useReducer(classroomReducer, data)
  const [selectedCatechists, setSelectedCatechists] = useState<catechist[]>(
    data.catechists!,
  )
  const [hasChangedCatechists, setHasChangedCatechists] =
    useState<boolean>(false)
  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  useEffect(() => {
    if (data) {
      reset({
        roomNumber: data.roomNumber,
        segment: data.segment,
        startedAt: data.startedAt,
        catechists: data.catechists,
      })
      dispatch({ type: ClassroomActionTypes.SET_ALL, payload: data })
      setSelectedCatechists(data.catechists!)
    }
  }, [data, isOpen, hasUserSubmittedForm, reset])

  async function handleSubmitNewClassroomForm() {
    setHasUserSubmittedForm(true)
    try {
      await ClassroomRepository.editClassroom(state)
        .finally(() => {
          onClose()
          reset()
          setHasUserSubmittedForm(false)
          dispatch({ type: ClassroomActionTypes.RESET })
          setSelectedCatechists([])
        })
        .then(() => {
          throwClassroomUpdate()
          if (hasChangedCatechists) {
            throwCatechistUpdate()
            setHasChangedCatechists(false)
          }
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
      className="flex w-9/12 flex-col rounded-xl bg-bunker-900 py-4 md:w-5/12 lg:w-3/12 2xl:w-3/12"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          Editar Turma
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(handleSubmitNewClassroomForm)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="roomNumber"
              control={control}
              defaultValue={state.roomNumber}
              rules={{
                value: state.roomNumber,
                required: true,
                onChange: (e) =>
                  dispatch({
                    type: ClassroomActionTypes.SET_ROOM_NUMBER,
                    payload: { roomNumber: e.target.value },
                  }),
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Turma"
                  description="Insira o número da Turma"
                  isInvalid={Boolean(errors.roomNumber)}
                  errorMessage={String(errors.roomNumber?.message)}
                />
              )}
            />

            <Controller
              name="segment"
              defaultValue={state.segment}
              control={control}
              rules={{
                required: true,
                value: state.segment!,
                onChange: (e) => {
                  dispatch({
                    type: ClassroomActionTypes.SET_SEGMENT,
                    payload: { segment: e.target.value },
                  })
                },
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Segmento"
                  size="md"
                  className="max-w-prose"
                  classNames={{
                    listbox: '!text-bunker-950',
                    innerWrapper: ' w-7/12',
                  }}
                  scrollShadowProps={{
                    isEnabled: false,
                  }}
                  selectedKeys={
                    field.value ? String(field.value).split(',') : ''
                  }
                  isInvalid={Boolean(errors.segment)}
                  errorMessage={String(errors.segment?.message)}
                >
                  {[
                    '1° Eucaristia',
                    'Crisma',
                    'Catequizandos Adultos',
                    'Catecúmenos Adultos',
                    'Sementinha',
                    'Pré-Eucaristia',
                  ].map((segment) => (
                    <SelectItem key={segment} value={segment}>
                      {segment}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="startedAt"
              control={control}
              defaultValue={state.startedAt}
              rules={{
                value: state.startedAt,
                required: true,
                onChange: (e) =>
                  dispatch({
                    type: ClassroomActionTypes.SET_STARTED_AT,
                    payload: { startedAt: e.target.value },
                  }),
              }}
              render={({ field }) => (
                <Input
                  label="Ano de início"
                  description="Digite um dos anos 2023, 2024, 2025"
                  {...field}
                  isInvalid={Boolean(errors.startedAt)}
                  errorMessage={String(errors.startedAt?.message)}
                />
              )}
            />

            <Controller
              name="catechists"
              defaultValue={selectedCatechists}
              control={control}
              rules={{
                required: true,
                value: selectedCatechists,
                onChange: (e) => {
                  setSelectedCatechists(
                    catechists.filter((catechist) =>
                      String(e.target.value).includes(catechist.id!),
                    ),
                  )
                  setHasChangedCatechists(true)

                  dispatch({
                    type: ClassroomActionTypes.SET_CATECHISTS,
                    payload: {
                      catechists: e.target.value
                        .split(',')
                        .map((id: string) => {
                          return {
                            id,
                          }
                        }),
                    },
                  })
                },
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Catequistas"
                  size="md"
                  selectionMode="multiple"
                  isMultiline
                  className="max-w-prose"
                  classNames={{
                    listbox: '!text-bunker-950',
                    innerWrapper: ' w-7/12',
                    selectorIcon: 'text-bunker-950',
                  }}
                  scrollShadowProps={{
                    isEnabled: false,
                  }}
                  selectedKeys={selectedCatechists.map(
                    (catechist) => catechist.id!,
                  )}
                  isInvalid={Boolean(errors.catechists)}
                  errorMessage={String(errors.catechists?.message)}
                >
                  {catechists.map((catechist) => (
                    <SelectItem key={catechist.id!} value={catechist.name}>
                      {catechist.name}
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
              {hasUserSubmittedForm ? <CircularProgress /> : 'Salvar'}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
