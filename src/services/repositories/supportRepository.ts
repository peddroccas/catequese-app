import { adminApi } from '../adminApi'
import { publicApi } from '../api'

export interface SupportAttachment {
  id: string
  name: string
  mimeType: string
  sizeBytes: number
}
export interface SupportMessage {
  id: string
  text: string
  sender: string
  direction: 'IN' | 'OUT'
  status: string
  note: string | null
  createdAt: string
  attachments: SupportAttachment[]
}
export interface SupportTicket {
  id: string
  protocol: string
  name: string
  email: string
  subject: string
  category: string
  source: string
  context: string | null
  status: 'OPEN' | 'RESOLVED'
  updatedAt: string
  messages: SupportMessage[]
}
export interface SupportList {
  items: SupportTicket[]
  total: number
  totalPages: number
  page: number
  simulated: boolean
  failedTasks: { id: string; kind: string; key: string; createdAt: string }[]
}
export const supportRepository = {
  async config(): Promise<{ email: string }> {
    return (await publicApi.get('/public/contact')).data
  },
  async submit(data: FormData): Promise<{ protocol: string }> {
    return (await publicApi.post('/public/contact', data)).data
  },
  async list(q: string, status: string, page: number): Promise<SupportList> {
    return (
      await adminApi.get('/admin/support', {
        params: { q, status: status || undefined, page },
      })
    ).data
  },
  async detail(id: string): Promise<SupportTicket> {
    return (await adminApi.get(`/admin/support/${id}`)).data
  },
  async reply(id: string, text: string, requestId: string) {
    await adminApi.post(`/admin/support/${id}/replies`, { text, requestId })
  },
  async status(id: string, status: SupportTicket['status']) {
    await adminApi.patch(`/admin/support/${id}`, { status })
  },
  async attachment(id: string, fileId: string): Promise<string> {
    return (await adminApi.get(`/admin/support/${id}/attachments/${fileId}`))
      .data.url
  },
  async retry(id: string) {
    await adminApi.post(`/admin/support/tasks/${id}/retry`)
  },
}
