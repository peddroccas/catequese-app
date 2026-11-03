export const DEFAULT_AREA_CODE = '61'

// Formata enquanto digita: (61) 99999-9999 ou (61) 3333-4444
export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (!digits) {
    return ''
  }
  if (digits.length <= 2) {
    return `(${digits}`
  }

  const areaCode = digits.slice(0, 2)
  const number = digits.slice(2)
  const splitAt = number.length > 8 ? 5 : 4

  if (number.length <= splitAt) {
    return `(${areaCode}) ${number}`
  }
  return `(${areaCode}) ${number.slice(0, splitAt)}-${number.slice(splitAt)}`
}
