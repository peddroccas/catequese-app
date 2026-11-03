import { CalendarDate, parseDate } from '@internationalized/date'

// A API envia datas sem hora como 'AAAA-MM-DD'. Nunca usar new Date(data)
// para exibir: o navegador converte para UTC-3 e mostra o dia anterior.
function splitDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number)
  return { year, month, day }
}

export function formatDate(date?: string | null) {
  if (!date) {
    return ''
  }
  const { year, month, day } = splitDate(date)
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

export function calculateAge(date?: string | null) {
  if (!date) {
    return undefined
  }
  const { year, month, day } = splitDate(date)
  const today = new Date()
  let age = today.getFullYear() - year
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day)
  if (!hasHadBirthdayThisYear) {
    age--
  }
  return age
}

export function toCalendarDate(date?: string | null) {
  if (!date) {
    return null
  }
  return parseDate(date.slice(0, 10))
}

export function fromCalendarDate(date?: CalendarDate | null) {
  return date ? date.toString() : undefined
}

export function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
