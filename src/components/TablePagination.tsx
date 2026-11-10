import { Pagination } from '@nextui-org/react'

interface TablePaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  pageSizes: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

// Rodapé de tabela paginada: "Mostrando 21–40 de 134", botões de página e
// quantidade por página
export function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  pageSizes,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <span className="text-sm tabular-nums text-bunker-500" aria-live="polite">
        {total === 0
          ? 'Nenhum resultado'
          : `Mostrando ${first}–${last} de ${total}`}
      </span>

      {totalPages > 1 && (
        <Pagination
          showControls
          size="sm"
          color="primary"
          total={totalPages}
          page={page}
          onChange={onPageChange}
        />
      )}

      <label className="flex items-center gap-2 text-sm text-bunker-500">
        Por página
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-bunker-200 bg-white px-2 py-1 text-bunker-900 shadow-sm outline-none focus:border-bunker-400"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </nav>
  )
}
