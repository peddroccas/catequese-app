import { Checkbox, Input } from '@nextui-org/react'
import { useReducer } from 'react'
import {
  catechizingInitialState,
  catechizingReducer,
} from '../../../reducer/catechizing/catechizingReducer'
import { CatechizingActionTypes } from '../../../reducer/catechizing/catechizingActionTypes'

export function AddNewCatechizingForm() {
  const [state, dispatch] = useReducer(
    catechizingReducer,
    catechizingInitialState,
  )
  return (
    <div className="mt-4 flex flex-grow flex-col items-center justify-start gap-8 pb-8 pt-4">
      <h1 className="text-2xl text-white">Adicionar Novo Catequizando</h1>
      <form className="flex w-11/12 flex-col gap-4 rounded-xl bg-bunker-900 p-4 md:w-6/12 lg:w-5/12 2xl:w-3/12">
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
        <Input
          label="Date de Nascimento"
          value={state.birthday.toDateString()}
          onChange={(e) =>
            dispatch({
              type: CatechizingActionTypes.SET_BIRTHDAY,
              payload: { birthday: e.target.value },
            })
          }
        />
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
          Pessoa com necessidade Especial
        </Checkbox>
      </form>
    </div>
  )
}
