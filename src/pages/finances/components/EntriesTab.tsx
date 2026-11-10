import { toast } from '@/lib/toast'
import { ConfirmModal } from '@/components/ConfirmModal'
import { DragScroll } from '@/components/DragScroll'
import { RowAction } from '@/components/IconButton'
import { SearchInput } from '@/components/SearchInput'
import { tableClassNames } from '@/components/tableStyles'
import { getErrorMessage } from '@/services/api'
import { FinanceRepository } from '@/services/repositories/financeRepository'
import {
  entry,
  entrySource,
  entrySourceLabels,
  entrySources,
  paymentMethodLabels,
} from '@/Types'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { matchesSearch } from '@/utils/search'
import {
  Button,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'
import { EntryModal } from './EntryModal'

// Entradas do caixa, de todas as origens (só a coordenação)
export function EntriesTab() {
  const [entries, setEntries] = useState<entry[]>([])
  const [search, setSearch] = useState<string>('')
  const [sourceFilter, setSourceFilter] = useState<entrySource | ''>('')
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [editing, setEditing] = useState<entry>()
  const [deleting, setDeleting] = useState<entry>()

  const loadEntries = useCallback(() => {
    FinanceRepository.getEntries()
      .then(setEntries)
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const filtered = entries.filter(
    (entry) =>
      (!sourceFilter || entry.source === sourceFilter) &&
      (matchesSearch(entry.payerName ?? '', search) ||
        matchesSearch(entry.catechizingName ?? '', search) ||
        matchesSearch(entry.description ?? '', search)),
  )
  const total = filtered.reduce((sum, entry) => sum + entry.amountCents, 0)

  return (
    <div className="flex flex-col gap-4">
      {isAdding && (
        <EntryModal onClose={() => setIsAdding(false)} onSaved={loadEntries} />
      )}
      {editing && (
        <EntryModal
          data={editing}
          onClose={() => setEditing(undefined)}
          onSaved={loadEntries}
        />
      )}
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        title="Deseja realmente deletar a entrada?"
        confirmLabel="Deletar"
        color="danger"
        onConfirm={async () => {
          await FinanceRepository.deleteEntry(deleting!.id!)
          loadEntries()
        }}
      >
        {deleting && entrySourceLabels[deleting.source]}
        {deleting?.payerName ? ` – ${deleting.payerName}` : ''} –{' '}
        {formatCurrency(deleting?.amountCents ?? 0)} (
        {formatDate(deleting?.date)})
      </ConfirmModal>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar nome ou observação"
          />
          <Select
            aria-label="Filtrar por origem"
            placeholder="Todas as origens"
            variant="bordered"
            selectedKeys={sourceFilter ? [sourceFilter] : []}
            onChange={(event) =>
              setSourceFilter(event.target.value as entrySource | '')
            }
            className="sm:w-56"
            classNames={{
              trigger:
                'border-1 border-bunker-200 bg-white shadow-sm data-[hover=true]:border-bunker-300',
              listbox: 'text-bunker-800',
              selectorIcon: 'text-bunker-500',
            }}
          >
            {entrySources.map((source) => (
              <SelectItem key={source}>{entrySourceLabels[source]}</SelectItem>
            ))}
          </Select>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={() => setIsAdding(true)}
        >
          Nova entrada
        </Button>
      </div>

      <DragScroll>
        <Table aria-label="Entradas do caixa" classNames={tableClassNames}>
          <TableHeader>
            <TableColumn align="center">DATA</TableColumn>
            <TableColumn align="start">ORIGEM</TableColumn>
            <TableColumn align="start">DETALHES</TableColumn>
            <TableColumn align="center">FORMA</TableColumn>
            <TableColumn align="end">VALOR</TableColumn>
            <TableColumn align="center">AÇÕES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhuma entrada registrada">
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>
                  <span className="whitespace-nowrap font-medium text-bunker-900">
                    {entrySourceLabels[entry.source]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {entry.catechizingName && (
                      <span className="font-medium">
                        {entry.catechizingName}
                      </span>
                    )}
                    {entry.payerName && (
                      <span className="text-bunker-600">
                        {entry.source === 'CARNE' ? 'Pago por ' : ''}
                        {entry.payerName}
                      </span>
                    )}
                    {entry.description && (
                      <span className="text-xs text-bunker-500">
                        {entry.description}
                      </span>
                    )}
                    {!entry.catechizingName &&
                      !entry.payerName &&
                      !entry.description && (
                        <span className="text-bunker-300">–</span>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  {paymentMethodLabels[entry.paymentMethod]}
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap font-medium tabular-nums text-emerald-600">
                    + {formatCurrency(entry.amountCents)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-0.5">
                    <RowAction
                      label="Editar"
                      icon={<PencilSimple size={18} />}
                      onPress={() => setEditing(entry)}
                    />
                    <RowAction
                      label="Deletar"
                      variant="danger"
                      icon={<Trash size={18} />}
                      onPress={() => setDeleting(entry)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DragScroll>
      {filtered.length > 0 && (
        <p className="text-right text-sm text-bunker-500">
          Total{search || sourceFilter ? ' do filtro' : ''}:{' '}
          <span className="font-semibold tabular-nums text-bunker-900">
            {formatCurrency(total)}
          </span>
        </p>
      )}
    </div>
  )
}
