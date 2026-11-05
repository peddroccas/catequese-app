import { carne, entry, expense } from '@/Types'
import { api } from '../api'

export class FinanceRepository {
  static async getExpenses(): Promise<expense[]> {
    const response = await api.get('/finances/expenses')
    return response.data
  }

  static async createExpense(expense: expense): Promise<expense> {
    const response = await api.post('/finances/expenses', expense)
    return response.data
  }

  static async updateExpense(expense: expense): Promise<expense> {
    const response = await api.put('/finances/expenses', expense)
    return response.data
  }

  static async deleteExpense(expenseId: string) {
    await api.delete(`/finances/expenses/${encodeURIComponent(expenseId)}`)
  }

  static async getEntries(): Promise<entry[]> {
    const response = await api.get('/finances/entries')
    return response.data
  }

  static async createEntry(entry: entry): Promise<entry> {
    const response = await api.post('/finances/entries', entry)
    return response.data
  }

  static async updateEntry(entry: entry): Promise<entry> {
    const response = await api.put('/finances/entries', entry)
    return response.data
  }

  static async deleteEntry(entryId: string) {
    await api.delete(`/finances/entries/${encodeURIComponent(entryId)}`)
  }

  // Coordenação: todos os pagamentos; catequista: só das suas turmas
  static async getCarne(): Promise<carne> {
    const response = await api.get('/finances/carne')
    return response.data
  }

  // Recebimento do carnê (catequistas e coordenação)
  static async createCarnePayment(payment: {
    catechizingId: string
    payerName: string
    amountCents: number
    date: string
    paymentMethod: entry['paymentMethod']
  }): Promise<entry> {
    const response = await api.post('/finances/carne', payment)
    return response.data
  }
}
