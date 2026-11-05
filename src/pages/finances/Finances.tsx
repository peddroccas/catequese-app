import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { Tab, Tabs } from '@nextui-org/react'
import { CarneTab } from './components/CarneTab'
import { EntriesTab } from './components/EntriesTab'
import { ExpensesTab } from './components/ExpensesTab'
import { SummaryTab } from './components/SummaryTab'

// Finanças: a coordenação cuida do caixa (entradas e saídas) e do carnê; os
// catequistas só registram e consultam o carnê dos catequizandos das suas turmas
export function Finances() {
  const { user } = useAuth()

  // Espera o perfil carregar para não mostrar a visão errada por um instante
  if (!user) {
    return null
  }

  // Catequista: página "Carnê", só com o carnê das suas turmas
  if (user.role !== 'COORDINATOR') {
    return (
      <div className="flex flex-grow flex-col gap-6">
        <PageHeader
          title="Carnê"
          description="Pagamentos do carnê dos catequizandos das suas turmas"
        />
        <CarneTab />
      </div>
    )
  }

  return (
    <div className="flex flex-grow flex-col gap-6">
      <PageHeader
        title="Finanças"
        description="Caixa da catequese: entradas, saídas e carnê dos catequizandos"
      />
      <Tabs
        aria-label="Finanças"
        variant="underlined"
        classNames={{
          tabList: 'gap-6 border-b border-bunker-200 p-0',
          cursor: 'bg-bunker-800',
          tab: 'h-11 px-0',
          tabContent:
            'font-medium text-bunker-500 group-data-[selected=true]:text-bunker-900',
          panel: 'px-0 pt-5',
        }}
      >
        <Tab key="summary" title="Resumo">
          <SummaryTab />
        </Tab>
        <Tab key="entries" title="Entradas">
          <EntriesTab />
        </Tab>
        <Tab key="expenses" title="Saídas">
          <ExpensesTab />
        </Tab>
        <Tab key="carne" title="Carnê">
          <CarneTab />
        </Tab>
      </Tabs>
    </div>
  )
}
