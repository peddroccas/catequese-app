import catequeseLogo from '@/assets/catequese-logo.svg'
import { ConfirmModal } from '@/components/ConfirmModal'
import { surfaceClassName, tableClassNames } from '@/components/tableStyles'
import { APP_NAME } from '@/lib/config'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import { AdminRepository } from '@/services/repositories/adminRepository'
import { adminParish } from '@/Types'
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { saveAs } from 'file-saver'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DeleteParishModal,
  EditParishModal,
  NewParishModal,
  ResetCoordinatorModal,
} from './AdminParishModals'

// Painel de administração: letras maiores que o restante do sistema
const adminTableClassNames = {
  ...tableClassNames,
  th: 'bg-bunker-50 text-xs font-semibold uppercase tracking-wide text-bunker-500 first:rounded-none last:rounded-none',
  td: 'text-base text-bunker-800',
}

type Dialog =
  | { kind: 'new' }
  | { kind: 'edit'; parish: adminParish }
  | { kind: 'status'; parish: adminParish }
  | { kind: 'reset'; parish: adminParish }
  | { kind: 'delete'; parish: adminParish }

function formatDate(value: string | null) {
  if (!value) return '—'
  // paidUntil vem como data ISO: mostra só o dia, sem converter fuso
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function isOverdue(parish: adminParish) {
  return (
    parish.status === 'ACTIVE' &&
    parish.paidUntil !== null &&
    parish.paidUntil.slice(0, 10) < new Date().toISOString().slice(0, 10)
  )
}

// Painel de quem administra o sistema: todas as paróquias, em um lugar
export function AdminParishes() {
  const navigate = useNavigate()
  const [parishes, setParishes] = useState<adminParish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialog, setDialog] = useState<Dialog | null>(null)

  const load = useCallback(async () => {
    try {
      setParishes(await AdminRepository.list())
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function handleLogout() {
    AdminRepository.logout()
    navigate('/admin/login', { replace: true })
  }

  async function handleExport(parish: adminParish) {
    try {
      const blob = await AdminRepository.exportData(parish.id)
      saveAs(blob, `${parish.slug}-dados.json`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  async function copyLink(parish: adminParish) {
    const link = `${window.location.origin}/inscricao/${parish.slug}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link de inscrição copiado')
    } catch {
      toast.info(link)
    }
  }

  const activeCount = parishes.filter((p) => p.status === 'ACTIVE').length
  const catechizingsTotal = parishes.reduce(
    (sum, p) => sum + p.catechizingsCount,
    0,
  )
  const overdueCount = parishes.filter(isOverdue).length

  const close = () => setDialog(null)
  const statusParish = dialog?.kind === 'status' ? dialog.parish : null

  return (
    <div className="flex min-h-screen flex-col bg-bunker-50">
      <header className="flex h-[4.5rem] items-center justify-between gap-3 border-b border-white/5 bg-bunker-950 px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img className="w-11" src={catequeseLogo} alt="" />
          <span className="text-base font-semibold tracking-wide text-white">
            {APP_NAME} · Administração
          </span>
        </div>
        {/* Cabeçalho escuro: botão claro sobre fundo escuro (o "flat" padrão
            ficava cinza com letra escura e sumia) */}
        <Button
          size="md"
          variant="bordered"
          className="border-white/30 font-medium text-white hover:bg-white/10"
          onPress={handleLogout}
        >
          Sair
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-bunker-900">
              Paróquias
            </h1>
            <p className="text-base text-bunker-500">
              {activeCount} ativas · {catechizingsTotal} catequizandos no total
              {overdueCount > 0 && (
                <span className="font-medium text-danger">
                  {' '}
                  · {overdueCount} com pagamento vencido
                </span>
              )}
            </p>
          </div>
          <Button color="primary" onPress={() => setDialog({ kind: 'new' })}>
            Nova paróquia
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <Table
            aria-label="Paróquias"
            removeWrapper={false}
            classNames={adminTableClassNames}
          >
            <TableHeader>
              <TableColumn>Paróquia</TableColumn>
              <TableColumn>Coordenação</TableColumn>
              <TableColumn align="end">Catequizandos</TableColumn>
              <TableColumn>Plano</TableColumn>
              <TableColumn>Pago até</TableColumn>
              <TableColumn>Situação</TableColumn>
              <TableColumn align="end">Ações</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Nenhuma paróquia cadastrada">
              {parishes.map((parish) => (
                <TableRow key={parish.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-bunker-900">
                        {parish.name}
                      </span>
                      <span className="text-sm text-bunker-500">
                        {parish.city}/{parish.state} · /inscricao/{parish.slug}
                      </span>
                      {parish.customDomain && (
                        <span className="text-sm text-bunker-500">
                          {parish.customDomain}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {parish.coordinators.length ? (
                      <div className="flex flex-col text-sm">
                        {parish.coordinators.map((coordinator) => (
                          <span key={coordinator.email}>
                            {coordinator.name}
                            <span className="text-bunker-500">
                              {' '}
                              · {coordinator.email}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-bunker-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="tabular-nums">
                      {parish.catechizingsCount}
                    </span>
                    <span className="text-sm text-bunker-500">
                      {' '}
                      · {parish.classroomsCount} turmas
                    </span>
                  </TableCell>
                  <TableCell>{parish.plan}</TableCell>
                  <TableCell>
                    <span className={isOverdue(parish) ? 'text-danger' : ''}>
                      {formatDate(parish.paidUntil)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={parish.status === 'ACTIVE' ? 'success' : 'warning'}
                    >
                      {parish.status === 'ACTIVE' ? 'Ativa' : 'Suspensa'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button size="md" variant="bordered">
                          Ações
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label={`Ações de ${parish.name}`}
                        onAction={(key) => {
                          switch (key) {
                            case 'edit':
                              return setDialog({ kind: 'edit', parish })
                            case 'status':
                              return setDialog({ kind: 'status', parish })
                            case 'reset':
                              return setDialog({ kind: 'reset', parish })
                            case 'link':
                              return copyLink(parish)
                            case 'export':
                              return handleExport(parish)
                            case 'delete':
                              return setDialog({ kind: 'delete', parish })
                          }
                        }}
                      >
                        <DropdownItem key="edit">
                          Plano, vencimento e domínio
                        </DropdownItem>
                        <DropdownItem key="link">
                          Copiar link de inscrição
                        </DropdownItem>
                        <DropdownItem key="reset">
                          Redefinir senha do coordenador
                        </DropdownItem>
                        <DropdownItem key="export">Exportar dados</DropdownItem>
                        <DropdownItem key="status">
                          {parish.status === 'ACTIVE'
                            ? 'Suspender'
                            : 'Reativar'}
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                        >
                          Apagar para sempre
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <p className={`${surfaceClassName} p-4 text-sm text-bunker-500`}>
          Suspender bloqueia o login de quem é da paróquia e fecha o formulário
          de inscrição, mas não apaga nada. Os dados exportados ficam em JSON
          (sem os arquivos de documentos enviados).
        </p>
      </main>

      {dialog?.kind === 'new' && (
        <NewParishModal onClose={close} onCreated={load} />
      )}
      {dialog?.kind === 'edit' && (
        <EditParishModal
          parish={dialog.parish}
          onClose={close}
          onSaved={load}
        />
      )}
      {dialog?.kind === 'reset' && (
        <ResetCoordinatorModal parish={dialog.parish} onClose={close} />
      )}
      {dialog?.kind === 'delete' && (
        <DeleteParishModal
          parish={dialog.parish}
          onClose={close}
          onDeleted={load}
        />
      )}
      {statusParish && (
        <ConfirmModal
          isOpen
          onClose={close}
          title={
            statusParish.status === 'ACTIVE'
              ? `Suspender ${statusParish.name}?`
              : `Reativar ${statusParish.name}?`
          }
          confirmLabel={
            statusParish.status === 'ACTIVE' ? 'Suspender' : 'Reativar'
          }
          color={statusParish.status === 'ACTIVE' ? 'danger' : 'primary'}
          onConfirm={async () => {
            await AdminRepository.update(statusParish.id, {
              status: statusParish.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
            })
            toast.success(
              statusParish.status === 'ACTIVE'
                ? 'Paróquia suspensa'
                : 'Paróquia reativada',
            )
            await load()
          }}
        >
          {statusParish.status === 'ACTIVE'
            ? 'Ninguém da paróquia consegue entrar e o formulário de inscrição fecha. Os dados continuam guardados e dá para reativar quando quiser.'
            : 'A paróquia volta a funcionar normalmente.'}
        </ConfirmModal>
      )}
    </div>
  )
}
