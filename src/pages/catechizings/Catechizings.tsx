import { Button, Spinner } from '@nextui-org/react'
import { PageHeader } from '@/components/PageHeader'
import { FileXls, UserPlus } from '@phosphor-icons/react'
import { useContext, useMemo, useRef, useState } from 'react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { AddNewCatechizingModal } from './components/modals/AddNewCatechizingModal'
import { ImportCatechizingsModal } from './components/modals/ImportCatechizingsModal'
import { CatechizingsTable } from './components/CatechizingsTable'
import { useAuth } from '@/hooks/useAuth'
import { PAGE_SIZES, useCatechizingsPage } from '@/hooks/useCatechizingsPage'
import { SearchInput } from '@/components/SearchInput'
import { TablePagination } from '@/components/TablePagination'
import { CatechizingsSummary } from './components/CatechizingsSummary'

const EMPTY_COUNTS = { all: 0, eucharist: 0, confirmation: 0, adults: 0 }

// Todos os catequizandos, paginados: o servidor entrega uma página por vez, já
// filtrada, pesquisada e ordenada
export function Catechizings() {
  const { user } = useAuth()
  const list = useCatechizingsPage()
  const { data, error, isFetching, group, page, pageSize, sort } = list
  const topRef = useRef<HTMLDivElement>(null)
  const { throwCatechizingUpdate } = useContext(ClassroomContext)
  const [isImporting, setIsImporting] = useState<boolean>(false)

  const [isUserAddingNewCatechizing, setIsUserAddingNewCatechizing] =
    useState<boolean>(false)

  const serverSort = useMemo(
    () => ({ ...sort, onChange: list.setSort }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort.column, sort.direction],
  )

  function handlePageChange(nextPage: number) {
    list.setPage(nextPage)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={topRef} className="flex flex-grow scroll-mt-4 flex-col gap-6">
      {user?.role === 'COORDINATOR' && (
        <AddNewCatechizingModal
          isOpen={isUserAddingNewCatechizing}
          onClose={() => setIsUserAddingNewCatechizing(false)}
        />
      )}
      {user?.role === 'COORDINATOR' && (
        <ImportCatechizingsModal
          isOpen={isImporting}
          onClose={() => setIsImporting(false)}
          onImported={throwCatechizingUpdate}
        />
      )}
      <PageHeader
        title="Catequizandos"
        description="Todos os catequizandos da paróquia"
      >
        {user?.role === 'COORDINATOR' && (
          <Button
            variant="bordered"
            startContent={<FileXls size={18} />}
            onPress={() => setIsImporting(true)}
          >
            Importar planilha
          </Button>
        )}
        {user?.role === 'COORDINATOR' && (
          <Button
            color="primary"
            startContent={<UserPlus size={18} />}
            onPress={() => setIsUserAddingNewCatechizing(true)}
          >
            Novo catequizando
          </Button>
        )}
      </PageHeader>
      <CatechizingsSummary
        counts={data?.counts ?? EMPTY_COUNTS}
        selectedGroup={group}
        onSelect={list.setGroup}
      />
      <SearchInput value={list.searchText} onChange={list.setSearchText} />

      {error ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
        >
          <span>Não foi possível carregar os catequizandos: {error}</span>
          <Button size="sm" color="danger" variant="flat" onPress={list.reload}>
            Tentar de novo
          </Button>
        </div>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <Spinner label="Carregando catequizandos" />
        </div>
      ) : (
        <>
          {/* A lista antiga fica na tela, mais clara, enquanto a nova carrega */}
          <div
            aria-busy={isFetching}
            className={
              isFetching
                ? 'opacity-60 transition-opacity'
                : 'transition-opacity'
            }
          >
            <CatechizingsTable
              catechizings={data.items}
              isAdultClassroom={group === 'adults'}
              serverSort={serverSort}
              startIndex={(data.page - 1) * data.pageSize}
            />
          </div>
          <TablePagination
            page={data.page}
            pageSize={pageSize}
            total={data.total}
            totalPages={data.totalPages}
            pageSizes={PAGE_SIZES}
            onPageChange={handlePageChange}
            onPageSizeChange={list.setPageSize}
          />
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {isFetching ? 'Carregando' : `Página ${page}`}
      </span>
    </div>
  )
}
