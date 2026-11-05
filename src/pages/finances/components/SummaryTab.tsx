import { surfaceClassName } from '@/components/tableStyles'
import { getErrorMessage } from '@/services/api'
import { FinanceRepository } from '@/services/repositories/financeRepository'
import { entry, entrySourceLabels, entrySources, expense } from '@/Types'
import { formatCurrency } from '@/utils/currency'
import { ReactNode, useEffect, useState } from 'react'

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'positive' | 'negative' | 'neutral'
}) {
  const color = {
    positive: 'text-emerald-600',
    negative: 'text-red-500',
    neutral: 'text-bunker-900',
  }[tone]
  return (
    <div className={`${surfaceClassName} flex flex-col gap-1 p-5`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
        {label}
      </span>
      <span className={`text-2xl font-semibold tabular-nums ${color}`}>
        {value}
      </span>
    </div>
  )
}

function Breakdown({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className={`${surfaceClassName} flex flex-col gap-3 p-5`}>
      <h2 className="text-sm font-semibold text-bunker-900">{title}</h2>
      <dl className="flex flex-col divide-y divide-bunker-100 text-sm">
        {children}
      </dl>
    </div>
  )
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-bunker-600">{label}</dt>
      <dd className="font-medium tabular-nums text-bunker-800">
        {formatCurrency(value)}
      </dd>
    </div>
  )
}

// Resumo do caixa: entradas, saídas e saldo (só a coordenação)
export function SummaryTab() {
  const [entries, setEntries] = useState<entry[]>()
  const [expenses, setExpenses] = useState<expense[]>()

  useEffect(() => {
    FinanceRepository.getEntries()
      .then(setEntries)
      .catch((error) => alert(getErrorMessage(error)))
    FinanceRepository.getExpenses()
      .then(setExpenses)
      .catch((error) => alert(getErrorMessage(error)))
  }, [])

  if (!entries || !expenses) {
    return <p className="text-bunker-500">Carregando...</p>
  }

  const sum = (items: { amountCents: number }[]) =>
    items.reduce((total, item) => total + item.amountCents, 0)
  const totalIn = sum(entries)
  const totalOut = sum(expenses)
  const balance = totalIn - totalOut

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Entradas"
          value={formatCurrency(totalIn)}
          tone="positive"
        />
        <StatCard
          label="Saídas"
          value={formatCurrency(totalOut)}
          tone="negative"
        />
        <StatCard
          label="Saldo em caixa"
          value={formatCurrency(balance)}
          tone={balance < 0 ? 'negative' : 'neutral'}
        />
      </div>
      <div className="max-w-xl">
        <Breakdown title="Entradas por origem">
          {entrySources.map((source) => (
            <Line
              key={source}
              label={entrySourceLabels[source]}
              value={sum(entries.filter((entry) => entry.source === source))}
            />
          ))}
        </Breakdown>
      </div>
    </div>
  )
}
