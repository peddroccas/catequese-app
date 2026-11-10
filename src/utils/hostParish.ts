import { ParishRepository } from '@/services/repositories/parishRepository'
import { publicParish } from '@/Types'

// Endereços que nunca são de uma paróquia (desenvolvimento e o endereço
// gratuito da Vercel): nem vale perguntar à API
function isGenericHost(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.vercel.app')
  )
}

let pending: Promise<publicParish | null> | null = null

// A paróquia dona do endereço em que o app foi aberto (domínio próprio ou
// subdomínio), ou null no endereço genérico. Pergunta uma vez por carregamento
export function resolveHostParish(): Promise<publicParish | null> {
  if (!pending) {
    const hostname = window.location.hostname.toLowerCase()
    pending = isGenericHost(hostname)
      ? Promise.resolve(null)
      : ParishRepository.resolveHost(window.location.host).catch(() => null)
  }
  return pending
}
