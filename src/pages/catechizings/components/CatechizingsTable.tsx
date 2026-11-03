import { catechizing } from '@/Types'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor,
} from '@nextui-org/react'
import { Check, X } from '@phosphor-icons/react'
import ToolBar from './ToolBar'
import { ReactNode, useContext, useMemo, useState } from 'react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { calculateAge } from '@/utils/date'
import { tableClassNames } from '@/components/tableStyles'
import { maskPhone } from '@/utils/phone'

interface CatechizingsTableProps {
  catechizings: catechizing[]
  hasPageClassroomInfo?: boolean
  isAdultClassroom?: boolean
  isReadOnly?: boolean
}

interface column {
  key: string
  label: string
  allowsSorting?: boolean
  align?: 'start' | 'center'
}

function BooleanIcon({ value }: { value: boolean | null }) {
  if (value === null) {
    return <span className="text-bunker-300">–</span>
  }
  return value ? (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
      <Check size={14} weight="bold" />
    </span>
  ) : (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-400">
      <X size={14} weight="bold" />
    </span>
  )
}

function Lines({ items }: { items: string[] }) {
  if (!items.length) {
    return <span className="text-bunker-300">–</span>
  }
  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <span key={index} className="whitespace-nowrap">
          {item || '-'}
        </span>
      ))}
    </div>
  )
}

export function CatechizingsTable({
  catechizings,
  hasPageClassroomInfo,
  isAdultClassroom,
  isReadOnly,
}: CatechizingsTableProps) {
  const { classrooms } = useContext(ClassroomContext)

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending',
  })

  const columns = useMemo(() => {
    const list: (column | false)[] = [
      { key: 'index', label: 'Nº', align: 'center' },
      { key: 'name', label: 'NOME', allowsSorting: true, align: 'start' },
      { key: 'age', label: 'IDADE', allowsSorting: true, align: 'center' },
      !hasPageClassroomInfo && { key: 'classroom', label: 'TURMA' },
      !hasPageClassroomInfo && { key: 'catechists', label: 'CATEQUISTA' },
      { key: 'parents', label: 'RESPONSÁVEL', align: 'start' },
      { key: 'phones', label: 'TEL. RESPONSÁVEL' },
      !isAdultClassroom && { key: 'goAwayAlone', label: 'VAI SOZINHO' },
      !!isAdultClassroom && { key: 'maritalStatus', label: 'ESTADO CIVIL' },
      !!isAdultClassroom && { key: 'livesWithPartner', label: 'MORA JUNTO' },
      { key: 'baptism', label: 'BATISMO', allowsSorting: true },
      { key: 'eucharist', label: '1ª EUCARISTIA' },
      !!isAdultClassroom && { key: 'marriage', label: 'MATRIMÔNIO' },
      { key: 'actions', label: 'AÇÕES' },
    ]
    return list.filter(Boolean) as column[]
  }, [hasPageClassroomInfo, isAdultClassroom])

  const sortedCatechizings = useMemo(() => {
    const direction = sortDescriptor.direction === 'ascending' ? 1 : -1
    return [...catechizings].sort((a, b) => {
      switch (sortDescriptor.column) {
        case 'age':
          return (
            ((calculateAge(a.birthday) ?? 0) -
              (calculateAge(b.birthday) ?? 0)) *
            direction
          )
        case 'baptism':
          return (
            (Number(b.hasReceivedBaptism) - Number(a.hasReceivedBaptism)) *
            direction
          )
        default:
          return a.name.localeCompare(b.name) * direction
      }
    })
  }, [catechizings, sortDescriptor])

  function renderCell(
    catechizing: catechizing,
    index: number,
    key: string,
  ): ReactNode {
    const classroom = classrooms.find(
      (classroom) => classroom.id === catechizing.classroomId,
    )
    switch (key) {
      case 'index':
        return <span className="tabular-nums text-bunker-400">{index + 1}</span>
      case 'name':
        return (
          <span className="whitespace-nowrap font-medium text-bunker-900">
            {catechizing.name}
          </span>
        )
      case 'age':
        return calculateAge(catechizing.birthday) ?? '-'
      case 'classroom':
        return (
          <span className="whitespace-nowrap">
            {classroom?.location ?? '–'}
          </span>
        )
      case 'catechists':
        return (
          classroom?.catechists
            ?.map((catechist) => catechist.nickname)
            .join(' e ') || '-'
        )
      case 'parents':
        return (
          <Lines items={catechizing.parents.map((parent) => parent.name)} />
        )
      case 'phones':
        return (
          <Lines
            items={catechizing.parents.map((parent) => maskPhone(parent.phone))}
          />
        )
      case 'goAwayAlone':
        return <BooleanIcon value={catechizing.releasedToGoAwayAlone} />
      case 'maritalStatus':
        return catechizing.maritalStatus ?? '-'
      case 'livesWithPartner':
        return <BooleanIcon value={catechizing.livesWithPartner} />
      case 'baptism':
        return <BooleanIcon value={catechizing.hasReceivedBaptism} />
      case 'eucharist':
        return <BooleanIcon value={catechizing.hasReceivedEucharist} />
      case 'marriage':
        return <BooleanIcon value={catechizing.hasReceivedMarriage} />
      case 'actions':
        return <ToolBar catechizing={catechizing} isReadOnly={isReadOnly} />
      default:
        return null
    }
  }

  return (
    <Table
      aria-label="Catequizandos"
      classNames={tableClassNames}
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.align ?? 'center'}
            allowsSorting={column.allowsSorting}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent="Nenhum catequizando encontrado">
        {sortedCatechizings.map((catechizing, index) => (
          <TableRow key={catechizing.id}>
            {(columnKey) => (
              <TableCell>
                <div
                  className={
                    columns.find((column) => column.key === columnKey)
                      ?.align === 'start'
                      ? ''
                      : 'flex justify-center'
                  }
                >
                  {renderCell(catechizing, index, String(columnKey))}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
