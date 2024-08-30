import { catechizing } from '../../Types'
import { CatechizingActionTypes } from './catechizingActionTypes'

export const catechizingInitialState = {
  name: '', // Nome inicial como string vazia
  birthday: null, // Data inicial (utiliza epoch time)
  address: '', // Endereço inicial como string vazia
  personWithSpecialNeeds: false, // Pode ser opcional e começando como undefined
  hasReceivedBaptism: false, // Inicialmente como false
  hasReceivedEucharist: false, // Inicialmente como false
  hasReceivedMarriage: false,
}
export function catechizingReducer(
  state: catechizing,
  action: { type: CatechizingActionTypes; payload?: any },
): catechizing {
  switch (action.type) {
    case CatechizingActionTypes.SET_ALL:
      return { ...action.payload }
    case CatechizingActionTypes.RESET:
      return catechizingInitialState
    case CatechizingActionTypes.SET_NAME:
      return { ...state, name: action.payload.name }
    case CatechizingActionTypes.SET_BIRTHDAY:
      return { ...state, birthday: action.payload.birthday }
    case CatechizingActionTypes.SET_ADDRESS:
      return { ...state, address: action.payload.address }
    case CatechizingActionTypes.SET_CATECHIZING_TO_CLASSROOM:
      return { ...state, classroom_id: action.payload.classroom_id }
    case CatechizingActionTypes.SET_PERSON_WITH_SPECIAL_NEEDS:
      return {
        ...state,
        personWithSpecialNeeds: action.payload.personWithSpecialNeeds,
      }
    case CatechizingActionTypes.SET_HAS_RECEIVED_BAPTISM:
      return { ...state, hasReceivedBaptism: action.payload.hasReceivedBaptism }
    case CatechizingActionTypes.SET_HAS_RECEIVED_EUCHARIST:
      return {
        ...state,
        hasReceivedEucharist: action.payload.hasReceivedEucharist,
      }
    case CatechizingActionTypes.SET_HAS_RECEIVED_MARRIAGE:
      return {
        ...state,
        hasReceivedMarriage: action.payload.hasReceivedMarriage,
      }
    default:
      return state
  }
}
