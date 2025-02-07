import { catechizing } from '@/Types'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react'
import { Check, X } from '@phosphor-icons/react'
import ToolBar from './ToolBar'
import { useContext, useState } from 'react'
import { ClassroomContext } from '@/contexts/ClassroomContext'

interface CatechizingsTableProps {
  catechizings: catechizing[]
  hasPageClassroomInfo?: boolean
}

export function CatechizingsTable({
  catechizings,
  hasPageClassroomInfo,
}: CatechizingsTableProps) {
  const { classrooms } = useContext(ClassroomContext)

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'NOME',
    direction: 'ascending' as 'ascending' | 'descending',
  })

  const handleSort = (column: string) => {
    setSortDescriptor((prev) => {
      const direction =
        prev.column === column && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending'
      return { column, direction }
    })
  }

  const sortedCatechizings = [...catechizings].sort((a, b) => {
    const column = sortDescriptor.column
    const direction = sortDescriptor.direction === 'ascending' ? 1 : -1

    switch (column) {
      case 'BATISMO':
        return (
          (a.hasReceivedBaptism === b.hasReceivedBaptism
            ? 0
            : a.hasReceivedBaptism
              ? -1
              : 1) * direction
        )
      case 'NOME':
        return a.name.localeCompare(b.name) * direction
      case 'CARNÊ':
        return (
          (a.payments![0]?.toBePaid ?? 0) -
          (b.payments![0]?.toBePaid ?? 0) * direction
        )
      default:
        return 0
    }
  })

  return (
    <Table
      aria-label="Catequizandos"
      classNames={{
        wrapper: 'bg-bunker-900',
        th: 'bg-bunker-300 !text-bunker-950',
        base: 'rounded-xl shadow shadow-black',

        sortIcon: 'text-bunker-950',
      }}
    >
      <TableHeader>
        <TableColumn align="center">NÚMERO</TableColumn>
        <TableColumn
          onClick={() => handleSort('NOME')}
          align="start"
          className="flex-1"
          allowsSorting
        >
          NOME
        </TableColumn>
        <TableColumn align="center" hidden={hasPageClassroomInfo}>
          TURMA
        </TableColumn>
        <TableColumn align="center" hidden={hasPageClassroomInfo}>
          CATEQUISTA
        </TableColumn>
        <TableColumn align="center">RESPONSÁVEL</TableColumn>
        <TableColumn align="center">TEL. RESPONSÁVEL</TableColumn>
        <TableColumn
          onClick={() => handleSort('CARNÊ')}
          align="center"
          allowsSorting
        >
          CARNÊ
        </TableColumn>
        <TableColumn
          onClick={() => handleSort('BATISMO')}
          align="center"
          allowsSorting
        >
          BATISMO
        </TableColumn>
        <TableColumn align="center">1° EUCARISTIA</TableColumn>
        <TableColumn align="center" className="w-fit">
          AÇÕES
        </TableColumn>
      </TableHeader>
      <TableBody>
        {sortedCatechizings.map((catechizing, index) => {
          const classroom = classrooms.find(
            (classroom) => classroom.id === catechizing.classroomId,
          )
          const { catechists } = classroom!
          return (
            <TableRow key={catechizing.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{catechizing.name}</TableCell>
              <TableCell hidden={hasPageClassroomInfo}>
                {classroom?.roomNumber}
              </TableCell>
              <TableCell hidden={hasPageClassroomInfo}>
                {catechists?.map((catechist) => catechist.nickname).join(' e ')}
              </TableCell>
              <TableCell>{catechizing.parents!.name}</TableCell>
              <TableCell>{catechizing.parents!.phone}</TableCell>
              <TableCell>
                <div className="flex justify-center text-red-500">
                  {catechizing.payments![0].toBePaid ? (
                    catechizing.payments![0].toBePaid.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })
                  ) : (
                    <Check size={20} className="text-green-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {catechizing.hasReceivedBaptism ? (
                    <Check size={20} className="text-green-500" />
                  ) : (
                    <X size={20} className="text-red-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {catechizing.hasReceivedEucharist ? (
                    <Check size={20} className="text-green-500" />
                  ) : (
                    <X size={20} className="text-red-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <ToolBar catechizing={catechizing} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
