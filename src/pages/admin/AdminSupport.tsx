import { BrandLogo } from '@/components/BrandLogo'
import { SearchInput } from '@/components/SearchInput'
import { TablePagination } from '@/components/TablePagination'
import { surfaceClassName } from '@/components/tableStyles'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import {
  supportRepository,
  SupportList,
  SupportTicket,
} from '@/services/repositories/supportRepository'
import { Button, Chip, Spinner, Textarea } from '@nextui-org/react'
import {
  ArrowLeft,
  ArrowSquareOut,
  ChatCircleText,
} from '@phosphor-icons/react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const categories: Record<string, string> = {
  BUG: 'Problema',
  QUESTION: 'Dúvida',
  SUGGESTION: 'Sugestão',
}
const delivery: Record<string, string> = {
  RECEIVED: 'Recebida',
  QUEUED: 'Na fila de envio',
  ACCEPTED: 'Aceita pelo serviço de e-mail',
  DELIVERED: 'Entregue',
  FAILED: 'Falha no envio',
  SIMULATED: 'Simulada no ambiente local',
}
const date = (value: string) =>
  new Date(value).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  })

export function AdminSupport() {
  const { ticketId } = useParams()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('OPEN')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<SupportList | null>(null)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const requestId = useRef(crypto.randomUUID())
  const busy = useRef(false)
  useEffect(() => {
    setText('')
    requestId.current = crypto.randomUUID()
    setTicket(null)
  }, [ticketId])
  useEffect(() => {
    let current = true
    setLoading(true)
    setError('')
    async function load() {
      try {
        const [list, detail] = await Promise.all([
          supportRepository.list(q, status, page),
          ticketId ? supportRepository.detail(ticketId) : Promise.resolve(null),
        ])
        if (current) {
          setData(list)
          setTicket(detail)
          setError('')
        }
      } catch (failure) {
        if (current) setError(getErrorMessage(failure))
      } finally {
        if (current) setLoading(false)
      }
    }
    load()
    const timer = setInterval(load, 15000)
    return () => {
      current = false
      clearInterval(timer)
    }
  }, [q, status, page, ticketId, refresh])
  async function reply(event: FormEvent) {
    event.preventDefault()
    if (!ticketId || !text.trim() || busy.current) return
    busy.current = true
    setSending(true)
    try {
      await supportRepository.reply(ticketId, text.trim(), requestId.current)
      setText('')
      requestId.current = crypto.randomUUID()
      setRefresh((v) => v + 1)
      toast.success('Resposta registrada na fila de envio.')
    } catch (failure) {
      toast.error(getErrorMessage(failure))
    } finally {
      busy.current = false
      setSending(false)
    }
  }
  async function changeStatus() {
    if (!ticket || changingStatus) return
    setChangingStatus(true)
    try {
      await supportRepository.status(
        ticket.id,
        ticket.status === 'OPEN' ? 'RESOLVED' : 'OPEN',
      )
      setRefresh((v) => v + 1)
    } catch (failure) {
      toast.error(getErrorMessage(failure))
    } finally {
      setChangingStatus(false)
    }
  }
  async function openImage(fileId: string) {
    if (!ticketId) return
    const tab = window.open('about:blank', '_blank')
    if (!tab) {
      toast.error('Permita abrir uma nova aba para visualizar a imagem.')
      return
    }
    tab.opener = null
    try {
      tab.location.assign(await supportRepository.attachment(ticketId, fileId))
    } catch (failure) {
      tab.close()
      toast.error(getErrorMessage(failure))
    }
  }
  return (
    <div className="flex min-h-screen flex-col bg-creme-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-bunker-200 bg-white px-4 py-3 sm:px-8">
        <Link to="/admin" aria-label="Administração do Catequese Hub">
          <BrandLogo />
        </Link>
        <nav aria-label="Administração" className="flex gap-4 text-sm">
          <Link to="/admin">Paróquias</Link>
          <Link
            to="/admin/support"
            aria-current="page"
            className="font-semibold underline underline-offset-4"
          >
            Atendimento
          </Link>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-8 sm:px-8">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-semibold">
            <ChatCircleText size={30} />
            Atendimento
          </h1>
          <p className="mt-2 text-bunker-600">
            Mensagens do Fale conosco e do e-mail de suporte.
          </p>
        </div>
        {data?.simulated && (
          <p className="rounded-xl border border-ouro-200 bg-ouro-50 p-4 text-sm text-ouro-700">
            Ambiente local: os e-mails são simulados no log da API. Nenhuma
            resposta é enviada de verdade.
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-4 rounded-xl bg-danger-50 p-4 text-danger-700"
          >
            <p>{error}</p>
            <Button size="sm" onPress={() => setRefresh((v) => v + 1)}>
              Tentar novamente
            </Button>
          </div>
        )}
        {ticketId ? (
          <>
            <Link
              to="/admin/support"
              className="flex items-center gap-2 text-sm text-bunker-700"
            >
              <ArrowLeft size={18} /> Voltar para contatos
            </Link>
            {loading && !ticket && <Spinner label="Carregando conversa" />}
            {ticket && (
              <>
                <section
                  className={`${surfaceClassName} flex flex-col gap-4 p-5`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-bunker-500">
                        {ticket.protocol} · {categories[ticket.category]} ·{' '}
                        {ticket.source === 'FORM' ? 'Formulário' : 'E-mail'}
                      </p>
                      <h2 className="mt-1 break-words text-xl font-semibold">
                        {ticket.subject}
                      </h2>
                      <p className="mt-2 break-all text-sm">
                        {ticket.name} · {ticket.email}
                      </p>
                    </div>
                    <Chip
                      color={ticket.status === 'OPEN' ? 'warning' : 'success'}
                      variant="flat"
                    >
                      {ticket.status === 'OPEN' ? 'Aberta' : 'Resolvida'}
                    </Chip>
                  </div>
                  {ticket.context && (
                    <p className="whitespace-pre-wrap break-words text-sm text-bunker-500">
                      {ticket.context}
                    </p>
                  )}
                  <Button
                    onPress={changeStatus}
                    isLoading={changingStatus}
                    variant="bordered"
                    className="self-start"
                  >
                    {ticket.status === 'OPEN'
                      ? 'Marcar como resolvida'
                      : 'Reabrir conversa'}
                  </Button>
                </section>
                <ol
                  className="flex flex-col gap-4"
                  aria-label="Histórico da conversa"
                >
                  {ticket.messages.map((message) => (
                    <li
                      key={message.id}
                      className={`${surfaceClassName} ${message.direction === 'OUT' ? 'border-l-4 border-l-bunker-600' : ''} p-5`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <strong>
                          {message.direction === 'OUT'
                            ? 'Catequese Hub'
                            : ticket.name}
                        </strong>
                        <time
                          dateTime={message.createdAt}
                          className="text-bunker-500"
                        >
                          {date(message.createdAt)}
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.text}
                      </p>
                      {message.note && (
                        <p className="mt-3 text-sm text-ouro-700">
                          {message.note}
                        </p>
                      )}
                      {message.attachments.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {message.attachments.map((file) => (
                            <li key={file.id}>
                              <Button
                                size="sm"
                                variant="bordered"
                                onPress={() => openImage(file.id)}
                                endContent={<ArrowSquareOut size={16} />}
                                className="max-w-full"
                              >
                                <span className="max-w-52 truncate">
                                  {file.name}
                                </span>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {message.direction === 'OUT' && (
                        <p
                          className={`mt-4 text-sm ${message.status === 'FAILED' ? 'text-danger' : 'text-bunker-500'}`}
                        >
                          {delivery[message.status] ?? message.status}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
                <form
                  onSubmit={reply}
                  className={`${surfaceClassName} flex flex-col gap-4 p-5`}
                >
                  <h2 className="text-xl font-semibold">
                    Responder pelo Catequese Hub
                  </h2>
                  <p className="break-all text-sm text-bunker-500">
                    Destino: {ticket.email}. A pessoa verá o endereço de suporte
                    do Catequese Hub.
                  </p>
                  <Textarea
                    label="Sua resposta"
                    value={text}
                    onValueChange={(value) => {
                      setText(value)
                      requestId.current = crypto.randomUUID()
                    }}
                    isRequired
                    maxLength={10000}
                    minRows={5}
                    isDisabled={sending}
                    variant="bordered"
                  />
                  <Button
                    type="submit"
                    color="primary"
                    isLoading={sending}
                    className="self-start"
                  >
                    Enviar resposta
                  </Button>
                </form>
              </>
            )}
          </>
        ) : (
          <>
            {!!data?.failedTasks.length && (
              <section className="rounded-xl border border-danger-200 bg-white p-4">
                <h2 className="font-semibold text-danger-700">
                  Envios ou recebimentos precisam de atenção
                </h2>
                <p className="mt-1 text-sm text-bunker-500">
                  Confira o Resend antes de repetir um envio. Tentativas com
                  mais de 23 horas exigem conferência manual.
                </p>
                <ul className="mt-3 flex flex-col gap-3">
                  {data.failedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        {task.kind === 'REPLY'
                          ? 'Resposta'
                          : task.kind === 'NOTIFY'
                            ? 'Notificação'
                            : 'Recebimento'}{' '}
                        · {date(task.createdAt)}
                      </span>
                      <Button
                        size="sm"
                        variant="bordered"
                        onPress={async () => {
                          try {
                            await supportRepository.retry(task.id)
                            setRefresh((v) => v + 1)
                          } catch (failure) {
                            toast.error(getErrorMessage(failure))
                          }
                        }}
                      >
                        Tentar novamente
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                value={q}
                onChange={(value) => {
                  setQ(value)
                  setPage(1)
                }}
                placeholder="Buscar assunto, e-mail ou protocolo"
              />
              <label className="flex items-center gap-2 text-sm">
                Situação
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value)
                    setPage(1)
                  }}
                  className="rounded-xl border border-bunker-200 bg-white p-2"
                >
                  <option value="OPEN">Abertas</option>
                  <option value="RESOLVED">Resolvidas</option>
                  <option value="">Todas</option>
                </select>
              </label>
            </div>
            {loading && !data ? (
              <Spinner label="Carregando contatos" />
            ) : (
              data && (
                <>
                  <ul className="flex flex-col gap-3" aria-label="Contatos">
                    {data.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/admin/support/${item.id}`}
                          className={`${surfaceClassName} flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:border-bunker-400`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-bunker-500">
                              {item.protocol} · {categories[item.category]}
                            </p>
                            <h2 className="break-words font-semibold">
                              {item.subject}
                            </h2>
                            <p className="break-all text-sm text-bunker-600">
                              {item.name} · {item.email}
                            </p>
                            {item.messages.some(
                              (m) => m.status === 'FAILED',
                            ) && (
                              <p className="text-sm text-danger">
                                Resposta com falha
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Chip
                              size="sm"
                              color={
                                item.status === 'OPEN' ? 'warning' : 'success'
                              }
                              variant="flat"
                            >
                              {item.status === 'OPEN' ? 'Aberta' : 'Resolvida'}
                            </Chip>
                            <span className="text-xs text-bunker-500">
                              {date(item.updatedAt)}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {!data.items.length && (
                    <p
                      className={`${surfaceClassName} p-8 text-center text-bunker-500`}
                    >
                      Nenhum contato encontrado.
                    </p>
                  )}
                  <TablePagination
                    page={page}
                    pageSize={20}
                    total={data.total}
                    totalPages={data.totalPages}
                    pageSizes={[20]}
                    onPageChange={setPage}
                    onPageSizeChange={() => {}}
                  />
                </>
              )
            )}
          </>
        )}
      </main>
    </div>
  )
}
