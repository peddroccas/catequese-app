import { useEffect, useState } from 'react'

// Só acompanha o valor depois que ele para de mudar por `delay` ms.
// Evita uma chamada à API a cada letra digitada
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
