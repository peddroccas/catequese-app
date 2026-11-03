// "Ana", "Ana e João", "Ana, João e Maria"
export function joinNames(names: string[]) {
  if (names.length <= 1) {
    return names.join('')
  }
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

// Ordena "Sala 2" antes de "Sala 10"
export function compareNatural(a: string, b: string) {
  return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' })
}
