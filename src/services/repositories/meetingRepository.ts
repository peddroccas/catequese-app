import { itinerary, meeting, meetingAttendance, meetingTheme } from '@/Types'
import { api } from '../api'

export interface meetingRequest {
  id?: string
  classroomId: string
  date: string
  themeIds: string[]
  attendances: meetingAttendance[]
}

export interface meetingThemeRequest {
  id?: string
  itinerary: itinerary
  phase: string
  name: string
}

export class MeetingRepository {
  static async getClassroomMeetings(classroomId: string): Promise<meeting[]> {
    const response = await api.get('/meetings', { params: { classroomId } })
    return response.data
  }

  static async createMeeting(meeting: meetingRequest): Promise<meeting> {
    const response = await api.post('/meetings', meeting)
    return response.data
  }

  static async updateMeeting(meeting: meetingRequest): Promise<meeting> {
    const response = await api.put('/meetings', meeting)
    return response.data
  }

  static async deleteMeeting(meetingId: string) {
    await api.delete(`/meetings/${encodeURIComponent(meetingId)}`)
  }

  static async getThemes(itinerary?: itinerary): Promise<meetingTheme[]> {
    const response = await api.get('/meeting-themes', {
      params: { itinerary },
    })
    return response.data
  }

  static async createTheme(theme: meetingThemeRequest): Promise<meetingTheme> {
    const response = await api.post('/meeting-themes', theme)
    return response.data
  }

  static async updateTheme(theme: meetingThemeRequest): Promise<meetingTheme> {
    const response = await api.put('/meeting-themes', theme)
    return response.data
  }

  static async deleteTheme(themeId: string) {
    await api.delete(`/meeting-themes/${encodeURIComponent(themeId)}`)
  }
}

// Agrupa os temas pela fase, na ordem do itinerário
export function groupThemesByPhase(themes: meetingTheme[]) {
  const groups: { phase: string; themes: meetingTheme[] }[] = []
  for (const theme of [...themes].sort((a, b) => a.position - b.position)) {
    const group = groups.find((item) => item.phase === theme.phase)
    if (group) {
      group.themes.push(theme)
    } else {
      groups.push({ phase: theme.phase, themes: [theme] })
    }
  }
  return groups
}
