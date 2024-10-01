import { catechist } from '../../Types'
import { CatechistActionTypes } from './catechistActionTypes'

export const catechistInitialState = {
  name: '', // Nome inicial como string vazia
  nickname: '',
  birthday: '1970-01-01T00:00:00.000Z', // Data inicial (utiliza epoch time)
  phone: '',
  address: '', // Endereço inicial como string vazia
  classroomId: undefined,
  hasReceivedBaptism: false, // Inicialmente como false
  hasReceivedEucharist: false, // Inicialmente como false
  hasReceivedConfirmation: false,
  hasReceivedMarriage: false,
  role: undefined,
}
export function catechistReducer(
  state: catechist,
  action: { type: CatechistActionTypes; payload?: any },
): catechist {
  switch (action.type) {
    case CatechistActionTypes.SET_ALL:
      return { ...action.payload }
    case CatechistActionTypes.RESET:
      return catechistInitialState
    case CatechistActionTypes.SET_NAME:
      return { ...state, name: action.payload.name }
    case CatechistActionTypes.SET_NICKNAME:
      return { ...state, nickname: action.payload.nickname }
    case CatechistActionTypes.SET_BIRTHDAY:
      return { ...state, birthday: action.payload.birthday }
    case CatechistActionTypes.SET_ADDRESS:
      return { ...state, address: action.payload.address }
    case CatechistActionTypes.SET_PHONE:
      return { ...state, phone: action.payload.phone }
    case CatechistActionTypes.SET_EMAIL:
      return { ...state, email: action.payload.email }
    case CatechistActionTypes.SET_CATECHIST_TO_CLASSROOM:
      return { ...state, classroomId: action.payload.classroomId }
    case CatechistActionTypes.SET_ROLE:
      return { ...state, role: action.payload.role }
    case CatechistActionTypes.SET_HAS_RECEIVED_BAPTISM:
      return { ...state, hasReceivedBaptism: action.payload.hasReceivedBaptism }
    case CatechistActionTypes.SET_HAS_RECEIVED_EUCHARIST:
      return {
        ...state,
        hasReceivedEucharist: action.payload.hasReceivedEucharist,
      }
    case CatechistActionTypes.SET_HAS_RECEIVED_MARRIAGE:
      return {
        ...state,
        hasReceivedMarriage: action.payload.hasReceivedMarriage,
      }
    case CatechistActionTypes.SET_HAS_RECEIVED_CONFIRMATION:
      return {
        ...state,
        hasReceivedConfirmation: action.payload.hasReceivedConfirmation,
      }
    default:
      return state
  }
}
