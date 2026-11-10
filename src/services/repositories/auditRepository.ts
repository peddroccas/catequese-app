import { auditLogEntry } from '../../Types'
import { api } from '../api'

export class AuditRepository {
  static async list(): Promise<auditLogEntry[]> {
    const response = await api.get('/audit-logs')
    return response.data
  }
}
