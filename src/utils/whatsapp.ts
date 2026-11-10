import { classroom, parent } from '@/Types'
import { getAreaCode } from './parish'

export const WHATSAPP_GROUP_LINK = /^https:\/\/chat\.whatsapp\.com\/\S+$/

// Número no formato que o wa.me aceita: 55 + DDD + número, só dígitos
export function toWhatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 8 || digits.length === 9) {
    return `55${getAreaCode()}${digits}`
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

function firstName(name: string) {
  return name.split(' ')[0]
}

// Aviso ao responsável quando a inscrição é aprovada e vai para uma turma
export function registrationApprovedMessage(
  contactName: string,
  catechizingName: string,
  classroom: classroom,
) {
  const lines = [
    `Olá, ${firstName(contactName)}! Tudo bem?`,
    `A inscrição de ${catechizingName} na catequese foi aprovada! A turma é ${classroom.name ?? classroom.location} (${classroom.segment}).`,
  ]
  if (classroom.whatsappGroupLink) {
    lines.push(
      `Entre no grupo do WhatsApp da turma pelo link: ${classroom.whatsappGroupLink}`,
    )
  }
  return lines.join('\n\n')
}

// Aviso quando falta algo: a família corrige e envia a inscrição de novo
export function registrationRejectedMessage(
  contactName: string,
  catechizingName: string,
  protocol: string,
  reason: string,
  formUrl: string,
) {
  return [
    `Olá, ${firstName(contactName)}! Tudo bem?`,
    `Recebemos a inscrição de ${catechizingName} na catequese (código ${protocol}), mas precisamos de um ajuste: ${reason}`,
    `Pode enviar a inscrição novamente, já corrigida, por este link: ${formUrl}`,
  ].join('\n\n')
}
