import { ConfirmModal } from '@/components/ConfirmModal'
import { DragScroll } from '@/components/DragScroll'
import { RowAction } from '@/components/IconButton'
import { SearchInput } from '@/components/SearchInput'
import { tableClassNames } from '@/components/tableStyles'
import { CatechistRepository } from '@/services/repositories/catechistRepository'
import { catechist } from '@/Types'
import { formatTimestamp } from '@/utils/date'
import { maskPhone } from '@/utils/phone'
import { matchesSearch } from '@/utils/search'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { ArrowCounterClockwise, Trash } from '@phosphor-icons/react'
import { useState } from 'react'

interface ArchivedCatechistsProps {
  catechists: catechist[]
  onChange: () => Promise<void>
}

export function ArchivedCatechists({
  catechists,
  onChange,
}: ArchivedCatechistsProps) {
  const [search, setSearch] = useState<string>('')
  const [restoring, setRestoring] = useState<catechist>()
  const [deleting, setDeleting] = useState<catechist>()

  const filteredCatechists = catechists.filter((catechist) =>
    matchesSearch(catechist.name, search),
  )

  if (!catechists.length) {
    return (
      <p className="text-sm text-bunker-500">Nenhum catequista arquivado.</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ConfirmModal
        isOpen={Boolean(restoring)}
        onClose={() => setRestoring(undefined)}
        title="Restaurar catequista?"
        confirmLabel="Restaurar"
        onConfirm={async () => {
          await CatechistRepository.restoreCatechist(restoring!.id!)
          await onChange()
        }}
      >
        <p>
          <strong>{restoring?.name}</strong> volta a acessar o sistema com a
          mesma senha. As turmas precisam ser atribuídas de novo na aba
          Catequistas.
        </p>
      </ConfirmModal>
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        title="Excluir catequista de vez?"
        confirmLabel="Excluir de vez"
        color="danger"
        onConfirm={async () => {
          await CatechistRepository.deleteCatechist(deleting!.id!)
          await onChange()
        }}
      >
        <p>
          Os dados de <strong>{deleting?.name}</strong> e as presenças dele(a)
          nas formações serão apagados permanentemente. Isso não pode ser
          desfeito.
        </p>
      </ConfirmModal>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Pesquisar catequista"
      />
      <DragScroll>
        <Table aria-label="Catequistas arquivados" classNames={tableClassNames}>
          <TableHeader>
            <TableColumn align="center">Nº</TableColumn>
            <TableColumn align="start">NOME</TableColumn>
            <TableColumn align="start">EMAIL</TableColumn>
            <TableColumn align="center">TELEFONE</TableColumn>
            <TableColumn align="center">ARQUIVADO EM</TableColumn>
            <TableColumn align="center">AÇÕES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum catequista encontrado">
            {filteredCatechists.map((catechist, index) => (
              <TableRow key={catechist.id}>
                <TableCell>
                  <span className="tabular-nums text-bunker-400">
                    {index + 1}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap font-medium text-bunker-900">
                    {catechist.name}
                  </span>
                </TableCell>
                <TableCell>{catechist.email}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {maskPhone(catechist.phone) || '–'}
                </TableCell>
                <TableCell>{formatTimestamp(catechist.archivedAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-0.5">
                    <RowAction
                      label="Restaurar"
                      icon={<ArrowCounterClockwise size={18} />}
                      onPress={() => setRestoring(catechist)}
                    />
                    <RowAction
                      label="Excluir de vez"
                      variant="danger"
                      icon={<Trash size={18} />}
                      onPress={() => setDeleting(catechist)}
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
