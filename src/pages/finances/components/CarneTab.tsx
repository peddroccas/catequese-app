import { toast } from '@/lib/toast'
import { ConfirmModal } from '@/components/ConfirmModal'
import { DragScroll } from '@/components/DragScroll'
import { RowAction } from '@/components/IconButton'
import { SearchInput } from '@/components/SearchInput'
import { surfaceClassName, tableClassNames } from '@/components/tableStyles'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { FinanceRepository } from '@/services/repositories/financeRepository'
import { carne, catechizing, entry, paymentMethodLabels } from '@/Types'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { matchesSearch } from '@/utils/search'
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { Eye, HandCoins, PencilSimple, Trash } from '@phosphor-icons/react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { EntryModal } from './EntryModal'

type status = 'paid' | 'partial' | 'none'

const statusLabels: Record<status, string> = {
  paid: 'Quitado',
  partial: 'Em andamento',
  none: 'Sem pagamento',
}

const statusColors: Record<status, 'success' | 'warning' | 'default'> = {
  paid: 'success',
  partial: 'warning',
  none: 'default',
}

// Carnê dos catequizandos: quem pagou, como, quando e quanto. Catequistas veem
// e registram só os das suas turmas; editar e apagar é da coordenação
export function CarneTab() {
  const { user } = useAuth()
  const { catechizings, classrooms } = useContext(ClassroomContext)
  const isCoordinator = user?.role === 'COORDINATOR'
  const [carne, setCarne] = useState<carne>()
  const [search, setSearch] = useState<string>('')
  const [classroomFilter, setClassroomFilter] = useState<string>('')
  const [receivingFor, setReceivingFor] = useState<string>()
  const [isReceiving, setIsReceiving] = useState<boolean>(false)
  const [viewingId, setViewingId] = useState<string>()
  const [editing, setEditing] = useState<entry>()
  const [deleting, setDeleting] = useState<entry>()

  const loadCarne = useCallback(() => {
    FinanceRepository.getCarne()
      .then(setCarne)
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [])

  useEffect(() => {
    loadCarne()
  }, [loadCarne])

  const visibleClassrooms = useMemo(
    () =>
      classrooms.filter(
        (classroom) =>
          isCoordinator || user?.classroomIds.includes(classroom.id!),
      ),
    [classrooms, isCoordinator, user?.classroomIds],
  )
  const visibleCatechizings = useMemo(
    () =>
      catechizings.filter((catechizing) =>
        visibleClassrooms.some(
          (classroom) => classroom.id === catechizing.classroomId,
        ),
      ),
    [catechizings, visibleClassrooms],
  )

  const totalCents = carne?.totalCents ?? 0
  const payments = useMemo(() => carne?.payments ?? [], [carne])
  const paidByCatechizing = useMemo(() => {
    const paid: Record<string, number> = {}
    for (const payment of payments) {
      if (payment.catechizingId) {
        paid[payment.catechizingId] =
          (paid[payment.catechizingId] ?? 0) + payment.amountCents
      }
    }
    return paid
  }, [payments])

  const rows = visibleCatechizings
    .filter(
      (catechizing) =>
        (!classroomFilter || catechizing.classroomId === classroomFilter) &&
        matchesSearch(catechizing.name, search),
    )
    .map((catechizing) => {
      const paid = paidByCatechizing[catechizing.id!] ?? 0
      const state: status =
        paid >= totalCents ? 'paid' : paid > 0 ? 'partial' : 'none'
      return { catechizing, paid, state }
    })
    .sort((a, b) => a.catechizing.name.localeCompare(b.catechizing.name))

  const totalPaid = rows.reduce((sum, row) => sum + row.paid, 0)
  const totalExpected = rows.length * totalCents

  const viewing = viewingId
    ? visibleCatechizings.find((catechizing) => catechizing.id === viewingId)
    : undefined
  const viewingPayments = payments.filter(
    (payment) => payment.catechizingId === viewingId,
  )

  function classroomName(catechizing: catechizing) {
    return (
      classrooms.find((classroom) => classroom.id === catechizing.classroomId)
        ?.name ?? ''
    )
  }

  function openReceive(catechizingId?: string) {
    setReceivingFor(catechizingId)
    setIsReceiving(true)
  }

  // Sem os dados o total do carnê é 0 e todos apareceriam como quitados
  if (!carne) {
    return <p className="text-bunker-500">Carregando...</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {isReceiving && (
        <EntryModal
          carneOnly
          presetCatechizingId={receivingFor}
          paidByCatechizing={paidByCatechizing}
          carneTotalCents={totalCents}
          onClose={() => setIsReceiving(false)}
          onSaved={loadCarne}
        />
      )}
      {editing && (
        <EntryModal
          carneOnly
          data={editing}
          paidByCatechizing={paidByCatechizing}
          carneTotalCents={totalCents}
          onClose={() => setEditing(undefined)}
          onSaved={loadCarne}
        />
      )}
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        title="Deseja realmente deletar o pagamento?"
        confirmLabel="Deletar"
        color="danger"
        onConfirm={async () => {
          await FinanceRepository.deleteEntry(deleting!.id!)
          loadCarne()
        }}
      >
        {deleting?.catechizingName} –{' '}
        {formatCurrency(deleting?.amountCents ?? 0)} (
        {formatDate(deleting?.date)})
      </ConfirmModal>

      <Modal
        isOpen={Boolean(viewing)}
        onClose={() => setViewingId(undefined)}
        placement="top"
        size="2xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-bunker-900">
            <span className="text-xl font-semibold">{viewing?.name}</span>
            <span className="text-sm font-normal text-bunker-500">
              Pago {formatCurrency(paidByCatechizing[viewingId ?? ''] ?? 0)} de{' '}
              {formatCurrency(totalCents)}
            </span>
          </ModalHeader>
          <ModalBody className="pb-6">
            {viewingPayments.length === 0 ? (
              <p className="text-sm text-bunker-500">
                Nenhum pagamento registrado.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-bunker-100">
                {viewingPayments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium text-bunker-900">
                        {formatCurrency(payment.amountCents)}
                        <span className="ml-2 text-sm font-normal text-bunker-500">
                          {paymentMethodLabels[payment.paymentMethod]} ·{' '}
                          {formatDate(payment.date)}
                        </span>
                      </span>
                      <span className="text-sm text-bunker-600">
                        Pago por {payment.payerName}
                      </span>
                      {payment.createdByName && (
                        <span className="text-xs text-bunker-400">
                          Registrado por {payment.createdByName}
                        </span>
                      )}
                    </div>
                    {isCoordinator && (
                      <div className="flex shrink-0 items-center gap-0.5">
                        <RowAction
                          label="Editar"
                          icon={<PencilSimple size={18} />}
                          onPress={() => setEditing(payment)}
                        />
                        <RowAction
                          label="Deletar"
                          variant="danger"
                          icon={<Trash size={18} />}
                          onPress={() => setDeleting(payment)}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Button
              color="primary"
              startContent={<HandCoins size={18} />}
              onPress={() => openReceive(viewingId)}
            >
              Registrar pagamento
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Totais do carnê: só a coordenação */}
      {isCoordinator && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Arrecadado',
              value: totalPaid,
              color: 'text-emerald-600',
            },
            {
              label: 'A receber',
              value: Math.max(totalExpected - totalPaid, 0),
              color: 'text-bunker-900',
            },
            {
              label: `Previsto (${rows.length} × ${formatCurrency(totalCents)})`,
              value: totalExpected,
              color: 'text-bunker-900',
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`${surfaceClassName} flex flex-col gap-1 p-5`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
                {card.label}
              </span>
              <span
                className={`text-2xl font-semibold tabular-nums ${card.color}`}
              >
                {formatCurrency(card.value)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput value={search} onChange={setSearch} />
          {visibleClassrooms.length > 1 && (
            <Select
              aria-label="Filtrar por turma"
              placeholder="Todas as turmas"
              variant="bordered"
              selectedKeys={classroomFilter ? [classroomFilter] : []}
              onChange={(event) => setClassroomFilter(event.target.value)}
              className="sm:w-64"
              classNames={{
                trigger:
                  'border-1 border-bunker-200 bg-white shadow-sm data-[hover=true]:border-bunker-300',
                listbox: 'text-bunker-800',
                selectorIcon: 'text-bunker-500',
              }}
            >
              {visibleClassrooms.map((classroom) => (
                <SelectItem key={classroom.id!}>{classroom.name}</SelectItem>
              ))}
            </Select>
          )}
        </div>
        <Button
          color="primary"
          startContent={<HandCoins size={18} />}
          onPress={() => openReceive()}
        >
          Registrar pagamento
        </Button>
      </div>

      <DragScroll>
        <Table
          aria-label="Carnê dos catequizandos"
          classNames={tableClassNames}
        >
          <TableHeader>
            <TableColumn align="start">CATEQUIZANDO</TableColumn>
            <TableColumn align="start">TURMA</TableColumn>
            <TableColumn align="end">PAGO</TableColumn>
            <TableColumn align="end">FALTA</TableColumn>
            <TableColumn align="center">SITUAÇÃO</TableColumn>
            <TableColumn align="center">AÇÕES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum catequizando encontrado">
            {rows.map(({ catechizing, paid, state }) => (
              <TableRow key={catechizing.id}>
                <TableCell>
                  <span className="font-medium text-bunker-900">
                    {catechizing.name}
                  </span>
                </TableCell>
                <TableCell>{classroomName(catechizing)}</TableCell>
                <TableCell>
                  <span className="whitespace-nowrap tabular-nums">
                    {formatCurrency(paid)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap tabular-nums">
                    {formatCurrency(Math.max(totalCents - paid, 0))}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={statusColors[state]}
                    className="whitespace-nowrap"
                  >
                    {statusLabels[state]}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-0.5">
                    <RowAction
                      label="Registrar pagamento"
                      icon={<HandCoins size={18} />}
                      onPress={() => openReceive(catechizing.id)}
                    />
                    <RowAction
                      label="Ver pagamentos"
                      icon={<Eye size={18} />}
                      onPress={() => setViewingId(catechizing.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DragScroll>
    </div>
  )
}
