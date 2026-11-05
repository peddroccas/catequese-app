// Valores em dinheiro trafegam em centavos (inteiros) para não ter erro de
// arredondamento

export function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// '1.250,50', '12,5', '12.50' e 'R$ 350' viram centavos; inválido ou <= 0 vira null
export function parseCurrencyToCents(value: string) {
  const text = value.replace(/[^\d.,]/g, '')
  if (!text) {
    return null
  }
  let normalized: string
  if (text.includes(',')) {
    // Vírgula é o decimal; pontos são separador de milhar
    normalized = text.replace(/\./g, '').replace(',', '.')
  } else if (/\.\d{1,2}$/.test(text)) {
    normalized = text
  } else {
    normalized = text.replace(/\./g, '')
  }
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }
  return Math.round(amount * 100)
}

// Filtra o que é digitado no campo de valor: só números e uma vírgula, com até
// 2 casas decimais. Letras e símbolos são descartados; '.' vira vírgula
export function maskMoneyInput(value: string) {
  const text = value.replace(/[^\d.,]/g, '').replace(/\./g, ',')
  const [integer, ...rest] = text.split(',')
  if (!rest.length) {
    return integer.slice(0, 7)
  }
  return `${integer.slice(0, 7)},${rest.join('').slice(0, 2)}`
}

// Centavos para o campo de valor ('35000' -> '350,00')
export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',')
}
