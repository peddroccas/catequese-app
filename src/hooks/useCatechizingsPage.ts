import { ClassroomContext } from '@/contexts/ClassroomContext'
import { getErrorMessage } from '@/services/api'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import {
  catechizingGroup,
  catechizingSortColumn,
  catechizingsPage,
  sortDirection,
} from '@/Types'
import axios from 'axios'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from './useDebouncedValue'

export const PAGE_SIZES = [10, 20, 50]
const DEFAULT_PAGE_SIZE = 20
const GROUPS: catechizingGroup[] = [
  'all',
  'eucharist',
  'confirmation',
  'adults',
]
const SORT_COLUMNS: catechizingSortColumn[] = ['name', 'age', 'baptism']

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : fallback
}

// Lista paginada de catequizandos. O estado (página, busca, grupo, ordem) fica
// na URL: o botão voltar e o link compartilhado levam para a mesma tela.
// A busca espera o usuário parar de digitar, uma chamada nova cancela a
// anterior e a lista antiga continua na tela enquanto a nova carrega.
export function useCatechizingsPage() {
  const [params, setParams] = useSearchParams()
  const { catechizingsVersion } = useContext(ClassroomContext)

  const page = toPositiveInt(params.get('page'), 1)
  const sizeParam = toPositiveInt(params.get('size'), DEFAULT_PAGE_SIZE)
  const pageSize = PAGE_SIZES.includes(sizeParam)
    ? sizeParam
    : DEFAULT_PAGE_SIZE
  const search = params.get('q') ?? ''
  const groupParam = params.get('group') as catechizingGroup | null
  const group = groupParam && GROUPS.includes(groupParam) ? groupParam : 'all'
  const sortParam = params.get('sort') as catechizingSortColumn | null
  const sortBy =
    sortParam && SORT_COLUMNS.includes(sortParam) ? sortParam : 'name'
  const sortDirection: sortDirection =
    params.get('dir') === 'desc' ? 'desc' : 'asc'

  const [data, setData] = useState<catechizingsPage | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState<number>(0)

  // Valores padrão saem da URL para ela ficar curta
  const update = useCallback(
    (changes: Record<string, string | undefined>, replace = true) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === '') {
              next.delete(key)
            } else {
              next.set(key, value)
            }
          }
          return next
        },
        { replace },
      )
    },
    [setParams],
  )

  // O que a pessoa digita aparece na hora; a URL e a busca seguem depois da pausa
  const [searchText, setSearchText] = useState<string>(search)
  const debouncedSearch = useDebouncedValue(searchText, 300)
  useEffect(() => {
    const term = debouncedSearch.trim()
    if (term !== search) {
      update({ q: term || undefined, page: undefined })
    }
  }, [debouncedSearch, search, update])

  useEffect(() => {
    const controller = new AbortController()
    setIsFetching(true)
    setError(null)

    CatechizingRepository.getPage(
      { page, pageSize, search, group, sortBy, sortDirection },
      controller.signal,
    )
      .then((result) => {
        // Arquivou o último da última página: volta para a última que existe
        if (result.page > result.totalPages) {
          update({
            page: result.totalPages > 1 ? String(result.totalPages) : undefined,
          })
          return
        }
        setData(result)
        setIsFetching(false)
      })
      .catch((requestError) => {
        if (axios.isCancel(requestError)) {
          return
        }
        setError(getErrorMessage(requestError))
        setIsFetching(false)
      })

    return () => controller.abort()
  }, [
    page,
    pageSize,
    search,
    group,
    sortBy,
    sortDirection,
    catechizingsVersion,
    reloadKey,
    update,
  ])

  return {
    data,
    error,
    // true só enquanto carrega; a lista antiga continua visível
    isFetching,
    page,
    pageSize,
    group,
    sort: { column: sortBy, direction: sortDirection },
    searchText,
    setSearchText,
    setPage: (value: number) =>
      update({ page: value > 1 ? String(value) : undefined }, false),
    setPageSize: (value: number) =>
      update({
        size: value === DEFAULT_PAGE_SIZE ? undefined : String(value),
        page: undefined,
      }),
    setGroup: (value: catechizingGroup) =>
      update({ group: value === 'all' ? undefined : value, page: undefined }),
    setSort: (column: catechizingSortColumn, direction: sortDirection) =>
      update({
        sort: column === 'name' ? undefined : column,
        dir: direction === 'asc' ? undefined : direction,
        page: undefined,
      }),
    reload: () => setReloadKey((key) => key + 1),
  }
}
