import { classroom, parent } from '@/Types'
import { DEFAULT_AREA_CODE } from './phone'

export const WHATSAPP_GROUP_LINK = /^https:\/\/chat\.whatsapp\.com\/\S+$/

// Número no formato que o wa.me aceita: 55 + DDD + número, só dígitos
export function toWhatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 8 || digits.length === 9) {
    return `55${DEFAULT_AREA_CODE}${digits}`
  }
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  if (
    digits.startsWith('55') &&
    (digits.length === 12 || digits.length === 13)
  ) {
    return digits
  }
  return null
}

export function inviteMessage(
  parent: parent,
  catechizingName: string,
  classroom: classroom,
) {
  const firstName = parent.name.split(' ')[0]
  return [
    `Olá, ${firstName}! Tudo bem?`,
    `Este é o grupo do WhatsApp da turma ${classroom.name ?? classroom.location} (${classroom.segment}) da catequese, de ${catechizingName}.`,
    `Entre pelo link: ${classroom.whatsappGroupLink}`,
  ].join('\n\n')
}

// Abre a conversa no WhatsApp com a mensagem pronta; quem envia é a pessoa
export function whatsappChatUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
