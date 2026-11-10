import {
  dismissToast,
  getToasts,
  subscribeToasts,
  ToastKind,
} from '@/lib/toast'
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react'
import { useSyncExternalStore } from 'react'

const STYLES: Record<ToastKind, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-bunker-200 bg-white text-bunker-800',
}

const ICONS: Record<ToastKind, typeof Info> = {
  error: WarningCircle,
  success: CheckCircle,
  info: Info,
}

// Onde os avisos aparecem. Fica uma vez só, no topo do app
export function ToastViewport() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((item) => {
        const Icon = ICONS[item.kind]
        return (
          <div
            key={item.id}
            role={item.kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${STYLES[item.kind]}`}
          >
            <Icon size={20} weight="fill" className="mt-0.5 shrink-0" />
            <span className="flex-grow whitespace-pre-line">
              {item.message}
            </span>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => dismissToast(item.id)}
              className="shrink-0 rounded-full p-1 opacity-60 transition-opacity hover:opacity-100"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
