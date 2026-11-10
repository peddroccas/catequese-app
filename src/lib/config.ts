// Nome do produto (aparece no menu e na aba do navegador antes de a paróquia
// carregar). Trocar é só definir VITE_APP_NAME no build: nenhum código muda
export const APP_NAME: string = import.meta.env.VITE_APP_NAME || 'Catequese'

// Paróquia da inscrição quando o endereço não traz o slug (links antigos, de
// antes de existir mais de uma paróquia). Precisa ser a mesma da API
export const DEFAULT_PARISH_SLUG: string =
  import.meta.env.VITE_DEFAULT_PARISH_SLUG || 'aparecida-gama'
