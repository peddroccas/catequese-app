import { classroom } from '@/Types'
import { ClassroomActionTypes } from './classroomActionTypes'

export const classroomInitialState = {
  roomNumber: undefined,
  segment: undefined,
  startedAt: undefined,
  catechists: [],
}
export function classroomReducer(
  state: classroom,
  action: { type: ClassroomActionTypes; payload?: any },
): classroom {
  switch (action.type) {
    case ClassroomActionTypes.SET_ALL:
      return { ...action.payload }
    case ClassroomActionTypes.RESET:
      return classroomInitialState
    case ClassroomActionTypes.SET_ROOM_NUMBER:
      return { ...state, roomNumber: Number(action.payload.roomNumber) }
    case ClassroomActionTypes.SET_SEGMENT:
      return { ...state, segment: action.payload.segment }
    case ClassroomActionTypes.SET_STARTED_AT:
      return { ...state, startedAt: Number(action.payload.startedAt) }
    case ClassroomActionTypes.SET_CATECHISTS:
      return { ...state, catechists: action.payload.catechists }
    default:
      return state
  }
}
