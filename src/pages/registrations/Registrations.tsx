import { ConfirmModal } from '@/components/ConfirmModal'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { surfaceClassName } from '@/components/tableStyles'
import { useParish } from '@/hooks/useParish'
import { getErrorMessage } from '@/services/api'
import { RegistrationRepository } from '@/services/repositories/registrationRepository'
import {
  registration,
  registrationSegment,
  registrationSettings,
  registrationStatus,
} from '@/Types'
import { formatCurrency } from '@/utils/currency'
import { calculateAge, formatTimestamp } from '@/utils/date'
import { maskPhone } from '@/utils/phone'
import {
  getRegistrationSegment,
  isAgeOutOfRange,
  registrationSegments,
} from '@/utils/registration'
import { receiptPhoneOf } from '@/utils/registrationPayment'
import { matchesSearch } from '@/utils/search'
import { Button, Chip, Switch, Tab, Tabs } from '@nextui-org/react'
import { Copy, LinkSimple, PencilSimple, Warning } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RegistrationModal } from './components/RegistrationModal'

const tabs: { key: registrationStatus; label: string; empty: string }[] = [
  {
    key: 'PENDING',
    label: 'Pendentes',
    empty: 'Nenhuma inscrição esperando conferência.',
  },
  {
    key: 'APPROVED',
    label: 'Aprovadas',
    empty: 'Nenhuma inscrição aprovada ainda.',
  },
  { key: 'REJECTED', label: 'Recusadas', empty: 'Nenhuma inscrição recusada.' },
]

// Conferência das inscrições enviadas pelo formulário público. Só a coordenação
export function Registrations() {
  const [registrations, setRegistrations] = useState<registration[]>()
  const [settings, setSettings] = useState<registrationSettings>()
  const [tab, setTab] = useState<registrationStatus>('PENDING')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<registration>()
  const [isConfirmingOpen, setIsConfirmingOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const { parish } = useParish()
  const formUrl = `${window.location.origin}/inscricao/${parish?.slug ?? ''}`

  const load = useCallback(() => {
    Promise.all([
      RegistrationRepository.getAll(),
      RegistrationRepository.getSettings(),
    ])
      .then(([list, current]) => {
        setRegistrations(list)
        setSettings(current)
      })
      .catch((loadError) => setError(getErrorMessage(loadError)))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isOpen = settings?.isOpen
  const openSegments = settings?.openSegments ?? []

  // Muda só o que for enviado: abrir/fechar tudo ou as etapas
  async function updateSettings(changes: Partial<registrationSettings>) {
    setIsSwitching(true)
    setError('')
    try {
      setSettings(await RegistrationRepository.updateSettings(changes))
    } catch (switchError) {
      setError(getErrorMessage(switchError))
    } finally {
      setIsSwitching(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(formUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link da inscrição:', formUrl)
    }
  }

  const counts = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  } satisfies Record<registrationStatus, number>
  for (const item of registrations ?? []) {
    counts[item.status]++
  }

  const visible = (registrations ?? [])
    .filter((item) => item.status === tab)
    .filter(
      (item) =>
        !search ||
        matchesSearch(item.name, search) ||
        matchesSearch(item.protocol, search) ||
        item.parents.some((parent) => matchesSearch(parent.name, search)),
    )
    // Pendentes: quem enviou primeiro aparece primeiro. Os demais: os mais recentes
    .sort((a, b) =>
      tab === 'PENDING'
        ? a.createdAt.localeCompare(b.createdAt)
        : (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? ''),
    )

  return (
    <div className="flex flex-grow flex-col gap-6">
      <ConfirmModal
        isOpen={isConfirmingOpen}
        onClose={() => setIsConfirmingOpen(false)}
        title="Abrir as inscrições?"
        confirmLabel="Abrir inscrições"
        onConfirm={() => updateSettings({ isOpen: true })}
      >
        O formulário fica disponível para qualquer pessoa que tenha o link. Você
        pode fechar de novo quando quiser.
      </ConfirmModal>

      {selected && (
        <RegistrationModal
          key={selected.id}
          registration={selected}
          isOpen
          onClose={() => setSelected(undefined)}
          onReviewed={load}
        />
      )}

      <PageHeader
        title="Inscrições"
        description="Confira os dados e os documentos e coloque cada inscrição na turma."
      />

      <section
        className={`${surfaceClassName} flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div className="flex items-center gap-4">
          <Switch
            isSelected={Boolean(isOpen)}
            isDisabled={isOpen === undefined || isSwitching}
            onValueChange={(next) =>
              next
                ? setIsConfirmingOpen(true)
                : updateSettings({ isOpen: false })
            }
            aria-label="Inscrições abertas"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-bunker-900">
              {isOpen === undefined
                ? 'Carregando...'
                : isOpen
                  ? 'Inscrições abertas'
                  : 'Inscrições fechadas'}
            </span>
            <span className="text-sm text-bunker-500">
              {isOpen
                ? 'O formulário está recebendo inscrições.'
                : 'Quem abrir o link vê que as inscrições estão encerradas.'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-lg bg-bunker-50 px-3 py-2 text-xs text-bunker-700">
            {formUrl}
          </code>
          <Button
            size="sm"
            variant="flat"
            startContent={<Copy size={16} />}
            onPress={copyLink}
          >
            {copied ? 'Copiado!' : 'Copiar link'}
          </Button>
          <Button
            as="a"
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="light"
            startContent={<LinkSimple size={16} />}
          >
            Abrir
          </Button>
        </div>
      </section>

      <section className={`${surfaceClassName} flex flex-col gap-3 p-5`}>
        <div className="flex flex-col">
          <h2 className="font-semibold text-bunker-900">
            Etapas que recebem inscrição
          </h2>
          <p className="text-sm text-bunker-500">
            {!isOpen
              ? 'As inscrições estão fechadas, então nenhuma etapa recebe. A escolha abaixo vale quando você abrir.'
              : openSegments.length === 0
                ? 'Nenhuma etapa marcada: o formulário aparece como encerrado.'
                : 'Etapas desmarcadas aparecem como encerradas no formulário.'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {registrationSegments.map((item) => {
            const isChecked = openSegments.includes(item.key)

            return (
              <Switch
                key={item.key}
                isSelected={isChecked}
                isDisabled={settings === undefined || isSwitching}
                onValueChange={(next) =>
                  updateSettings({
                    openSegments: next
                      ? [...openSegments, item.key]
                      : openSegments.filter(
                          (key: registrationSegment) => key !== item.key,
                        ),
                  })
                }
                classNames={{
                  base: 'max-w-none rounded-xl border border-bunker-200 px-3 py-2',
                  label: 'text-sm text-bunker-800',
                }}
              >
                {item.title}
              </Switch>
            )
          })}
        </div>
      </section>

      {parish && (
        <section
          className={`${surfaceClassName} flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-bunker-900">
              Pagamento da inscrição
            </h2>
            {!parish.registrationFeeCents ? (
              <p className="text-sm text-bunker-500">
                Sem taxa de inscrição: o formulário não mostra valor nem PIX.
              </p>
            ) : parish.pixKey ? (
              <p className="text-sm text-bunker-600">
                {`${formatCurrency(parish.registrationFeeCents)} pelo PIX `}
                <strong className="break-all text-bunker-900">
                  {parish.pixKey}
                </strong>
                {parish.pixHolderName && ` (${parish.pixHolderName})`}.{' '}
                {receiptPhoneOf(parish)
                  ? `Comprovante pelo WhatsApp ${maskPhone(receiptPhoneOf(parish) ?? '')}.`
                  : 'Cadastre um WhatsApp para o comprovante.'}
              </p>
            ) : (
              <p className="text-sm text-bunker-500">
                Nenhuma chave PIX cadastrada: o formulário não mostra como
                pagar.
              </p>
            )}
          </div>
          <Button
            as={Link}
            to="/parish#pix"
            size="sm"
            variant="flat"
            startContent={<PencilSimple size={16} />}
          >
            {parish.pixKey ? 'Alterar PIX' : 'Cadastrar PIX'}
          </Button>
        </section>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key as registrationStatus)}
          aria-label="Situação das inscrições"
        >
          {tabs.map((item) => (
            <Tab key={item.key} title={`${item.label} (${counts[item.key]})`} />
          ))}
        </Tabs>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Nome, responsável ou código"
        />
      </div>

      {registrations === undefined ? (
        !error && <p className="text-sm text-bunker-500">Carregando...</p>
      ) : visible.length === 0 ? (
        <p className={`${surfaceClassName} p-6 text-sm text-bunker-500`}>
          {search
            ? 'Nenhuma inscrição encontrada.'
            : tabs.find((item) => item.key === tab)!.empty}
        </p>
      ) : (
        <ul className={`${surfaceClassName} divide-y divide-bunker-100`}>
          {visible.map((item) => {
            const info = getRegistrationSegment(item.segment)
            const age = calculateAge(item.birthday)
            const contact = item.parents[0]

            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-bunker-900">
                      {item.name}
                    </span>
                    <Chip size="sm" variant="flat">
                      {info.title}
                    </Chip>
                    {isAgeOutOfRange(info, age) && (
                      <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        startContent={<Warning size={12} />}
                      >
                        Idade fora da faixa
                      </Chip>
                    )}
                  </span>
                  <span className="truncate text-sm text-bunker-500">
                    {age !== undefined && `${age} anos · `}
                    {contact &&
                      `${contact.name}${contact.phone ? ` ${maskPhone(contact.phone)}` : ''} · `}
                    {item.files.length} documentos · enviada em{' '}
                    {formatTimestamp(item.createdAt)} · {item.protocol}
                  </span>
                  {item.status === 'REJECTED' && item.rejectionReason && (
                    <span className="text-sm text-red-700">
                      Motivo: {item.rejectionReason}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  color={item.status === 'PENDING' ? 'primary' : 'default'}
                  variant={item.status === 'PENDING' ? 'solid' : 'flat'}
                  onPress={() => setSelected(item)}
                >
                  {item.status === 'PENDING' ? 'Conferir' : 'Ver'}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
