import {
  Button,
  Checkbox,
  CircularProgress,
  DatePicker,
  Input,
  Modal,
  ModalContent,
} from '@nextui-org/react'
import { useReducer, useState } from 'react'
import {
  catechizingInitialState,
  catechizingReducer,
} from '../../../reducer/catechizing/catechizingReducer'
import { CatechizingActionTypes } from '../../../reducer/catechizing/catechizingActionTypes'
import { CatechizingRepository } from '../../../services/repositories/catechizingRepository'
import { I18nProvider } from '@react-aria/i18n'

interface AddNewCatechizingFormProps {
  isOpen: boolean
  onClose: () => void
}

export function AddNewCatechizingForm({
  isOpen,
  onClose,
}: AddNewCatechizingFormProps) {
  const [state, dispatch] = useReducer(
    catechizingReducer,
    catechizingInitialState,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="flex w-11/12 flex-col rounded-xl bg-bunker-900 p-4 md:w-6/12 lg:w-5/12 2xl:w-3/12"
    >
      <ModalContent>
        <form className="flex flex-col gap-4">
          <h1 className="text-2xl text-white">Adicionar Novo Catequizando</h1>

          <Input
            label="Nome"
            value={state.name}
            onChange={(e) =>
              dispatch({
                type: CatechizingActionTypes.SET_NAME,
                payload: { name: e.target.value },
              })
            }
          />
          <I18nProvider locale="pt-BR">
            <DatePicker
              label="Data"
              value={state.birthday}
              dateInputClassNames={{
                inputWrapper: 'border hover:border-2 focus:border-2',
              }}
              classNames={{ input: '!text-brown-500' }}
              onChange={(e) =>
                dispatch({
                  type: CatechizingActionTypes.SET_BIRTHDAY,
                  payload: { birthday: e },
                })
              }
              showMonthAndYearPickers
              isRequired
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

          <Button
            variant="solid"
            className="w-full p-2 font-medium shadow shadow-black"
            onClick={handleSubmitNewCatechizingForm}
            size="lg"
          >
            {hasUserSubmittedForm ? <CircularProgress /> : 'Cadastrar'}
          </Button>
        </form>
      </ModalContent>
    </Modal>
  )
}
