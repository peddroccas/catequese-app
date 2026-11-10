import { PageHeader } from '@/components/PageHeader'
import { surfaceClassName } from '@/components/tableStyles'
import { getErrorMessage } from '@/services/api'
import { AuditRepository } from '@/services/repositories/auditRepository'
import { auditLogEntry } from '@/Types'
import { Button, Spinner } from '@nextui-org/react'
import { useCallback, useEffect, useState } from 'react'

const ACTION_LABELS: Record<string, string> = {
  DOCUMENT_VIEWED: 'Abriu um documento',
  DOCUMENT_ZIP_DOWNLOADED: 'Baixou todos os documentos (zip)',
  DOCUMENT_REMOVED: 'Removeu um documento',
  REGISTRATION_DOCUMENT_VIEWED: 'Abriu um documento de inscrição',
  REGISTRATION_DOCUMENTS_ZIP_DOWNLOADED:
    'Baixou os documentos de uma inscrição (zip)',
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

// Quem abriu, baixou ou removeu documentos dos catequizandos. Dados de
// crianças e adolescentes: a coordenação precisa conseguir conferir
export function AccessLog() {
  const [logs, setLogs] = useState<auditLogEntry[] | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      setLogs(await AuditRepository.list())
    } catch (caught) {
      setError(getErrorMessage(caught))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Registro de acessos"
        description="Quem abriu ou baixou documentos de catequizandos (os 100 acessos mais recentes)"
      />
      {error ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
        >
          <span>Não foi possível carregar o registro: {error}</span>
          <Button size="sm" color="danger" variant="flat" onPress={load}>
            Tentar de novo
          </Button>
        </div>
      ) : !logs ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : logs.length === 0 ? (
        <p className={`${surfaceClassName} p-6 text-sm text-bunker-500`}>
          Nenhum acesso registrado ainda.
        </p>
      ) : (
        <ul className={`${surfaceClassName} divide-y divide-bunker-100`}>
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex flex-col gap-1 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-bunker-800">
                <strong>{log.actorName}</strong>{' '}
                {ACTION_LABELS[log.action] ?? log.action}
                {log.detail && (
                  <span className="text-bunker-500"> · {log.detail}</span>
                )}
              </span>
              <time
                dateTime={log.createdAt}
                className="text-xs tabular-nums text-bunker-500"
              >
                {dateFormat.format(new Date(log.createdAt))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
