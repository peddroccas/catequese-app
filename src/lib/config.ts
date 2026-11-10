// Nome do produto (aparece no menu e na aba do navegador antes de a paróquia
// carregar). Trocar é só definir VITE_APP_NAME no build: nenhum código muda
export const APP_NAME: string = import.meta.env.VITE_APP_NAME || 'Catequese'

// Paróquia da inscrição quando o endereço não traz o slug (links antigos, de
// antes de existir mais de uma paróquia). Precisa ser a mesma da API
export const DEFAULT_PARISH_SLUG: string =
  import.meta.env.VITE_DEFAULT_PARISH_SLUG || 'aparecida-gama'

// Recuperação de senha por e-mail ("Esqueci minha senha"). Só ligue depois de
// configurar o envio de e-mail na API (MAIL_DRIVER, MAIL_FROM com domínio
// verificado). Desligada, a tela manda pedir a senha temporária à coordenação
export const PASSWORD_RESET_BY_EMAIL: boolean =
  import.meta.env.VITE_PASSWORD_RESET_EMAIL === 'true'
