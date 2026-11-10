import { formatCurrency } from '@/utils/currency'
import { Money } from '@phosphor-icons/react'

interface RegistrationFeeNoticeProps {
  // Taxa de inscrição em centavos; sem taxa, nada aparece
  feeCents: number | null | undefined
  className?: string
}

// Valor da inscrição em destaque (escolha da etapa, formulário e confirmação)
export function RegistrationFeeNotice({
  feeCents,
  className = '',
}: RegistrationFeeNoticeProps) {
  if (!feeCents) {
    return null
  }

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 ${className}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <Money size={26} weight="duotone" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
          Taxa de inscrição
        </span>
        <span className="text-3xl font-semibold tabular-nums text-emerald-900">
          {formatCurrency(feeCents)}
        </span>
        <span className="mt-1 text-sm text-emerald-800">
          Dúvidas sobre o pagamento? Fale com a coordenação.
        </span>
      </div>
    </div>
  )
}
