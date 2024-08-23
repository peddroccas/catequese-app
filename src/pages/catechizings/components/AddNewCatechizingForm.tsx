import { Input } from '@nextui-org/react'
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
      <h1 className="text-2xl text-white">Adicionar Novo Catequista</h1>
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
        ></Input>
      </form>
    </div>
  )
}
