import { ConfirmModal } from '@/components/ConfirmModal'
import { RowAction } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { surfaceClassName } from '@/components/tableStyles'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { RiteRepository } from '@/services/repositories/riteRepository'
import { rite } from '@/Types'
import { matchesSearch } from '@/utils/search'
import { Button } from '@nextui-org/react'
import { FilePdf, PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'
import { RiteModal } from './components/RiteModal'

// Ritos da catequese, com os PDFs do roteiro. Todos consultam e baixam; só a
// coordenação cadastra, edita e apaga
export function Rites() {
  const { user } = useAuth()
  const isCoordinator = user?.role === 'COORDINATOR'
  const [rites, setRites] = useState<rite[]>()
  const [search, setSearch] = useState<string>('')
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [editing, setEditing] = useState<rite>()
  const [deleting, setDeleting] = useState<rite>()

  const loadRites = useCallback(() => {
    RiteRepository.getRites()
      .then(setRites)
      .catch((error) => alert(getErrorMessage(error)))
  }, [])

  useEffect(() => {
    loadRites()
  }, [loadRites])

  const filtered = (rites ?? []).filter(
    (rite) =>
      matchesSearch(rite.name, search) ||
      matchesSearch(rite.description ?? '', search),
  )

  return (
    <div className="flex flex-grow flex-col gap-6">
      {isAdding && (
        <RiteModal onClose={() => setIsAdding(false)} onSaved={loadRites} />
      )}
      {editing && (
        <RiteModal
          data={editing}
          onClose={() => setEditing(undefined)}
          onSaved={loadRites}
        />
      )}
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        title="Deseja realmente deletar o rito?"
        confirmLabel="Deletar"
        color="danger"
        onConfirm={async () => {
          await RiteRepository.deleteRite(deleting!.id!)
          loadRites()
        }}
      >
        {deleting?.name}
        {deleting?.files.length
          ? ` – ${deleting.files.length === 1 ? 'o PDF anexado também será apagado' : 'os PDFs anexados também serão apagados'}.`
          : ''}
      </ConfirmModal>

      <PageHeader
        title="Ritos"
        description="Roteiros dos ritos da catequese, em PDF"
      >
        {isCoordinator && (
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onPress={() => setIsAdding(true)}
          >
            Novo rito
          </Button>
        )}
      </PageHeader>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Pesquisar rito"
      />

      {!rites ? (
        <p className="text-bunker-500">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-bunker-500">
          {rites.length === 0
            ? 'Nenhum rito cadastrado.'
            : 'Nenhum rito encontrado.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((rite) => (
            <article
              key={rite.id}
              className={`${surfaceClassName} flex flex-col gap-3 p-4`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="font-semibold text-bunker-900">{rite.name}</h3>
                  {rite.description && (
                    <p className="text-sm text-bunker-600">
                      {rite.description}
                    </p>
                  )}
                </div>
                {isCoordinator && (
                  <div className="flex shrink-0 items-center gap-0.5">
                    <RowAction
                      label="Editar"
                      icon={<PencilSimple size={18} />}
                      onPress={() => setEditing(rite)}
                    />
                    <RowAction
                      label="Deletar"
                      variant="danger"
                      icon={<Trash size={18} />}
                      onPress={() => setDeleting(rite)}
                    />
                  </div>
                )}
              </div>
              {rite.files.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {rite.files.map((file) => (
                    <Button
                      key={file.id}
                      as="a"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="flat"
                      color="primary"
                      startContent={<FilePdf size={18} />}
                      className="justify-start"
                    >
                      <span className="min-w-0 truncate">
                        {file.name.replace(/\.pdf$/i, '')}
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-bunker-400">PDF ainda não anexado</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
