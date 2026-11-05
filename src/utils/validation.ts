import { z } from 'zod'
import { parseCurrencyToCents } from './currency'
import { today } from './date'

// Validadores reutilizáveis dos formulários (zod). Mensagens em português.

// Nome de pessoa: começa com letra e só tem letras (com acento), espaço,
// apóstrofo, ponto e hífen
const PERSON_NAME = /^\p{L}[\p{L}\s'.-]*$/u
const NAME_ERROR = 'Use apenas letras'

// Maior valor aceito em dinheiro (R$ 1.000.000,00), igual ao da API
const MAX_MONEY_CENTS = 100_000_000

function maxLength(max: number) {
  return `Máximo de ${max} caracteres`
}

// Texto obrigatório (sem validar o conteúdo)
export const requiredText = (max = 120) =>
  z.string().trim().min(1, 'Campo obrigatório').max(max, maxLength(max))

// Texto opcional (endereço, observação...)
export const optionalText = (max = 200) =>
  z.string().trim().max(max, maxLength(max))

// Nome de pessoa obrigatório: sem números nem símbolos
export const personName = (max = 100) =>
  requiredText(max).regex(PERSON_NAME, NAME_ERROR)

// Nome de pessoa que pode ficar em branco
export const optionalPersonName = (max = 100) =>
  z
    .string()
    .trim()
    .max(max, maxLength(max))
    .refine((value) => !value || PERSON_NAME.test(value), NAME_ERROR)

// Telefone com DDD: em branco, ou 10 (fixo) ou 11 (celular) dígitos
export const phoneNumber = () =>
  z.string().refine((value) => {
    const digits = value.replace(/\D/g, '').length
    return digits === 0 || digits === 10 || digits === 11
  }, 'Telefone inválido. Use DDD + número')

// Data 'AAAA-MM-DD' obrigatória
export const requiredDate = () =>
  z
    .string({ message: 'Campo obrigatório' })
    .min(1, 'Campo obrigatório')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')

// Data que não pode ser no futuro (pagamentos, gastos)
export const notFutureDate = () =>
  requiredDate().refine(
    (value) => value <= today(),
    'A data não pode ser futura',
  )

// Data de nascimento: não pode ser futura nem absurda
export const birthDate = () =>
  notFutureDate().refine((value) => value >= '1900-01-01', 'Data inválida')

// Valor em reais digitado ('350', '1250,50'): maior que zero e dentro do limite
export const moneyAmount = () =>
  z
    .string()
    .trim()
    .min(1, 'Informe o valor')
    .refine(
      (value) => parseCurrencyToCents(value) !== null,
      'Valor inválido. Use apenas números, ex.: 350,00',
    )
    .refine(
      (value) => (parseCurrencyToCents(value) ?? 0) <= MAX_MONEY_CENTS,
      'Valor muito alto',
    )
