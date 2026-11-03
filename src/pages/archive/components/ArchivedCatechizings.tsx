import { ClassroomSelect } from '@/components/ClassroomSelect'
import { DragScroll } from '@/components/DragScroll'
import { ConfirmModal } from '@/components/ConfirmModal'
import { RowAction } from '@/components/IconButton'
import { SearchInput } from '@/components/SearchInput'
import { tableClassNames } from '@/components/tableStyles'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { CatechizingInfoModal } from '@/pages/catechizings/components/modals/CatechizingInfoModal'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { catechizing, classroom } from '@/Types'
import { calculateAge, formatTimestamp } from '@/utils/date'
import { matchesSearch } from '@/utils/search'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { ArrowCounterClockwise, Info, Trash } from '@phosphor-icons/react'
import { useContext, useState } from 'react'

interface ArchivedCatechizingsProps {
  catechizings: catechizing[]
  archivedClassrooms: classroom[]
  onChange: () => Promise<void>
}

export function ArchivedCatechizings({
  catechizings,
  archivedClassrooms,
  onChange,
}: ArchivedCatechizingsProps) {
  const { classrooms } = useContext(ClassroomContext)
  const [search, setSearch] = useState<string>('')
  const [seeing, setSeeing] = useState<catechizing>()
  const [restoring, setRestoring] = useState<catechizing>()
  const [restoreClassroom, setRestoreClassroom] = useState<classroom>()
  const [deleting, setDeleting] = useState<catechizing>()

  const allClassrooms = [...classrooms, ...archivedClassrooms]
  const filteredCatechizings = catechizings.filter((catechizing) =>
    matchesSearch(catechizing.name, search),
  )

  function openRestore(catechizing: catechizing) {
    // Sugere a turma de antes, se ela ainda estiver ativa
    setRestoreClassroom(
      classrooms.find((classroom) => classroom.id === catechizing.classroomId),
    )
    setRestoring(catechizing)
  }

  if (!catechizings.length) {
    return (
      <p className="text-sm text-bunker-500">Nenhum catequizando arquivado.</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {seeing && (
        <CatechizingInfoModal
          isOpen
          data={seeing}
          onClose={() => setSeeing(undefined)}
        />
      )}
      <ConfirmModal
        isOpen={Boolean(restoring)}
        onClose={() => setRestoring(undefined)}
        title="Restaurar catequizando?"
        confirmLabel="Restaurar"
        onConfirm={async () => {
          if (!restoreClassroom) {
            throw new Error('Escolha a turma')
          }
          await CatechizingRepository.restoreCatechizing(
            restoring!.id!,
            restoreClassroom.id,
          )
          await onChange()
        }}
      >
        <p>
          Escolha a turma para onde <strong>{restoring?.name}</strong> volta:
        </p>
        <ClassroomSelect
          value={restoreClassroom ?? ({} as classroom)}
          onChange={(e) =>
            setRestoreClassroom(
              classrooms.find((classroom) => classroom.id === e.target.value),
            )
          }
        />
      </ConfirmModal>
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        title="Excluir catequizando de vez?"
        confirmLabel="Excluir de vez"
        color="danger"
        onConfirm={async () => {
          await CatechizingRepository.deleteCatechizing(deleting!.id!)
          await onChange()
        }}
      >
        <p>
          Os dados de <strong>{deleting?.name}</strong> serão apagados
          permanentemente. Isso não pode ser desfeito.
        </p>
      </ConfirmModal>

      <SearchInput value={search} onChange={setSearch} />
      <DragScroll>
        <Table
          aria-label="Catequizandos arquivados"
          classNames={tableClassNames}
        >
          <TableHeader>
            <TableColumn align="center">Nº</TableColumn>
            <TableColumn align="start">NOME</TableColumn>
            <TableColumn align="center">IDADE</TableColumn>
            <TableColumn align="center">TURMA</TableColumn>
            <TableColumn align="center">ARQUIVADO EM</TableColumn>
            <TableColumn align="center">AÇÕES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum catequizando encontrado">
            {filteredCatechizings.map((catechizing, index) => {
              const classroom = allClassrooms.find(
                (classroom) => classroom.id === catechizing.classroomId,
              )
              return (
                <TableRow key={catechizing.id}>
                  <TableCell>
                    <span className="tabular-nums text-bunker-400">
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="whitespace-nowrap font-medium text-bunker-900">
                      {catechizing.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    {calculateAge(catechizing.birthday) ?? '–'}
                  </TableCell>
                  <TableCell>
                    <span className="whitespace-nowrap">
                      {classroom
                        ? `${classroom.location} (${classroom.segment})${classroom.archivedAt ? ' · turma arquivada' : ''}`
                        : '–'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatTimestamp(catechizing.archivedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-0.5">
                      <RowAction
                        label="Ver dados"
                        icon={<Info size={18} />}
                        onPress={() => setSeeing(catechizing)}
                      />
                      <RowAction
                        label="Restaurar"
                        icon={<ArrowCounterClockwise size={18} />}
                        onPress={() => openRestore(catechizing)}
                      />
                      <RowAction
                        label="Excluir de vez"
                        variant="danger"
                        icon={<Trash size={18} />}
                        onPress={() => setDeleting(catechizing)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </DragScroll>
    </div>
  )
}
