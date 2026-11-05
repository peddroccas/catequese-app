import { ConfirmModal } from '@/components/ConfirmModal'
import { DragScroll } from '@/components/DragScroll'
import { RowAction } from '@/components/IconButton'
import { SearchInput } from '@/components/SearchInput'
import { tableClassNames } from '@/components/tableStyles'
import { getErrorMessage } from '@/services/api'
import { FinanceRepository } from '@/services/repositories/financeRepository'
import { expense, paymentMethodLabels } from '@/Types'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { matchesSearch } from '@/utils/search'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'
import { ExpenseModal } from './ExpenseModal'

// Saídas do caixa (só a coordenação)
export function ExpensesTab() {
  const [expenses, setExpenses] = useState<expense[]>([])
  const [search, setSearch] = useState<string>('')
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [editing, setEditing] = useState<expense>()
  const [deleting, setDeleting] = useState<expense>()

  const loadExpenses = useCallback(() => {
    FinanceRepository.getExpenses()
      .then(setExpenses)
      .catch((error) => alert(getErrorMessage(error)))
  }, [])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const filtered = expenses.filter((expense) =>
    matchesSearch(expense.description, search),
  )
  const total = filtered.reduce((sum, expense) => sum + expense.amountCents, 0)

  return (
    <div className="flex flex-col gap-4">
      {isAdding && (
        <ExpenseModal
          onClose={() => setIsAdding(false)}
          onSaved={loadExpenses}
        />
      )}
      {editing && (
        <ExpenseModal
          data={editing}
          onClose={() => setEditing(undefined)}
          onSaved={loadExpenses}
        />
      )}
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        title="Deseja realmente deletar a saída?"
        confirmLabel="Deletar"
        color="danger"
        onConfirm={async () => {
          await FinanceRepository.deleteExpense(deleting!.id!)
          loadExpenses()
        }}
      >
        {deleting?.description} – {formatCurrency(deleting?.amountCents ?? 0)} (
        {formatDate(deleting?.date)})
      </ConfirmModal>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Pesquisar destinação"
        />
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={() => setIsAdding(true)}
        >
          Nova saída
        </Button>
      </div>

      <DragScroll>
        <Table aria-label="Saídas do caixa" classNames={tableClassNames}>
          <TableHeader>
            <TableColumn align="center">DATA</TableColumn>
            <TableColumn align="start">DESTINAÇÃO</TableColumn>
            <TableColumn align="center">FORMA</TableColumn>
            <TableColumn align="end">VALOR</TableColumn>
            <TableColumn align="start">REGISTRADO POR</TableColumn>
            <TableColumn align="center">AÇÕES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhuma saída registrada">
            {filtered.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>
                  <span className="font-medium text-bunker-900">
                    {expense.description}
                  </span>
                </TableCell>
                <TableCell>
                  {paymentMethodLabels[expense.paymentMethod]}
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap font-medium tabular-nums text-red-500">
                    − {formatCurrency(expense.amountCents)}
                  </span>
                </TableCell>
                <TableCell>
                  {expense.createdByName || (
                    <span className="text-bunker-300">–</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-0.5">
                    <RowAction
                      label="Editar"
                      icon={<PencilSimple size={18} />}
                      onPress={() => setEditing(expense)}
                    />
                    <RowAction
                      label="Deletar"
                      variant="danger"
                      icon={<Trash size={18} />}
                      onPress={() => setDeleting(expense)}
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
          Total{search ? ' da pesquisa' : ''}:{' '}
          <span className="font-semibold tabular-nums text-bunker-900">
            {formatCurrency(total)}
          </span>
        </p>
      )}
    </div>
  )
}
