import { parent } from '@/Types'
import { ParentActionTypes } from './ParentActionTypes'

export const parentInitialState = {
  name: '',
  phone: '',
  kinship: '',
}
export function parentReducer(
  state: parent,
  action: { type: ParentActionTypes; payload?: any },
): parent {
  switch (action.type) {
    case ParentActionTypes.SET_ALL:
      return { ...action.payload }
    case ParentActionTypes.RESET:
      return parentInitialState
    case ParentActionTypes.SET_NAME:
      return { ...state, name: action.payload.name }
    case ParentActionTypes.SET_PHONE:
      return { ...state, phone: action.payload.phone }
    case ParentActionTypes.SET_KINSHIP:
      return { ...state, kinship: action.payload.kinship }
    default:
      return state
  }
}
