import type { publicParish } from '@/Types'

// A paróquia em uso agora (a do catequista logado ou a da página de inscrição).
// Fica fora do React de propósito: os PDFs, o DDD dos telefones e as mensagens
// de WhatsApp são gerados por funções comuns, que não têm acesso a hooks.
// Quem carrega a paróquia (ParishProvider, página de inscrição) chama
// setCurrentParish; o resto só lê.
let current: publicParish | null = null

export function setCurrentParish(parish: publicParish | null) {
  current = parish
}

export function getCurrentParish(): publicParish | null {
  return current
}

// DDD para completar telefones digitados sem ele. O padrão só vale até a
// paróquia carregar (as telas que usam telefone esperam por ela)
export function getAreaCode(): string {
  return current?.areaCode ?? '61'
}

// Linhas do cabeçalho de todo documento, em maiúsculas:
// "ARQUIDIOCESE DE BRASÍLIA" e "PARÓQUIA NOSSA SENHORA APARECIDA – GAMA / DF"
export function parishHeaderLines(): string[] {
  if (!current) {
    return []
  }
  return [
    current.dioceseName.toLocaleUpperCase('pt-BR'),
    `${current.name.toLocaleUpperCase('pt-BR')} – ${current.city.toLocaleUpperCase('pt-BR')} / ${current.state}`,
  ]
}
