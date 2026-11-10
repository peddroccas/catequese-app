// Avisos rápidos na tela (no lugar do alert() do navegador). Funciona de
// qualquer lugar, componente ou não: toast.error('Não foi possível salvar')

export type ToastKind = 'error' | 'success' | 'info'

export interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

const DURATION: Record<ToastKind, number> = {
  error: 8000,
  success: 4000,
  info: 6000,
}
// Nunca empilha mais que isso: um erro repetido não cobre a tela
const MAX_VISIBLE = 4

let items: ToastItem[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Sempre uma lista nova quando algo muda (exigência do useSyncExternalStore)
export function getToasts() {
  return items
}

export function dismissToast(id: number) {
  items = items.filter((item) => item.id !== id)
  emit()
}

function push(kind: ToastKind, message: string) {
  const id = nextId++
  items = [...items, { id, kind, message }].slice(-MAX_VISIBLE)
  emit()
  setTimeout(() => dismissToast(id), DURATION[kind])
}

export const toast = {
  error: (message: string) => push('error', message),
  success: (message: string) => push('success', message),
  info: (message: string) => push('info', message),
}
