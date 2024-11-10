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
import { CatechistActionTypes } from '@/reducer/catechist/catechistActionTypes'
import { I18nProvider } from '@react-aria/i18n'
import { Controller, useForm } from 'react-hook-form'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import {
  catechistReducer,
  catechistInitialState,
} from '@/reducer/catechist/catechistReducer'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useReducer, useState } from 'react'
import { z } from 'zod'
import { classroom } from '@/Types'

const addNewCatechistFormSchema = z.object({
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

interface AddNewCatechistFormModal {
  isOpen: boolean
  onClose: () => void
}

export function AddNewCatechistModal({
  isOpen,
  onClose,
}: AddNewCatechistFormModal) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addNewCatechistFormSchema),
  })
  const { classrooms, throwCatechistUpdate, throwClassroomUpdate } =
    useContext(ClassroomContext)
  const [state, dispatch] = useReducer(catechistReducer, catechistInitialState)
  const [selectedClassroom, setSelectedClassroom] = useState<classroom>(
    {} as classroom,
  )

  const [hasUserSubmittedForm, setHasUserSubmittedForm] =
    useState<boolean>(false)

  async function handleSubmitNewCatechistForm() {
    setHasUserSubmittedForm(true)
    try {
      await CatechistRepository.createNewCatechist(state)
        .then(() => {
          throwCatechistUpdate()
          throwClassroomUpdate()
        })
        .finally(() => {
          setHasUserSubmittedForm(false)
          throwCatechistUpdate()
          dispatch({ type: CatechistActionTypes.RESET })
          setSelectedClassroom({} as classroom)
          reset()
          onClose()
        })
    } catch (error) {
      console.error(error)
    }
  }

  const roleSelected = () => {
    switch (state.role) {
      case 'COORDINATOR':
        return 'COORDINATOR'
      case 'MEMBER':
        return 'MEMBER'
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
          Adicionar Novo Catequista
        </ModalHeader>
        <ModalBody>
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
            <Controller
              name="nickname"
              control={control}
              rules={{
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
            <I18nProvider locale="pt-BR">
              <Controller
                name="birthday"
                control={control}
                rules={{
                  required: true,
                  value: state.birthday!,
                  onChange: (e) => {
                    console.log(e.target.value.toString())
                    dispatch({
                      type: CatechistActionTypes.SET_BIRTHDAY,
                      payload: { birthday: e.target.value.toString() },
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
                  />
                )}
              />
            </I18nProvider>
            <Controller
              name="email"
              control={control}
              rules={{
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
              description={'Escreva no formato (DD) 9XXXX-XXXX'}
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

            <Select
              label="Função"
              value={state.role}
              onChange={(e) =>
                dispatch({
                  type: CatechistActionTypes.SET_ROLE,
                  payload: { role: e.target.value },
                })
              }
              size="md"
              className="max-w-prose"
              classNames={{
                listbox: '!text-bunker-950',
                selectorIcon: 'text-bunker-950',
              }}
              selectedKeys={roleSelected() && undefined}
            >
              {['COORDINATOR', 'MEMBER'].map((role) => (
                <SelectItem key={role} value={role}>
                  {role !== 'COORDINATOR'
                    ? role !== 'Membro'
                      ? ''
                      : 'MEMBER'
                    : 'Coordenador'}
                </SelectItem>
              ))}
            </Select>

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
                required: false,
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
                  classNames={{
                    listbox: '!text-bunker-950',
                    selectorIcon: 'text-bunker-950',
                  }}
                  selectedKeys={[field.value]}
                  isInvalid={Boolean(errors.classroom)}
                  errorMessage={String(errors.classroom?.message)}
                >
                  {classrooms.map((classroom) => (
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
