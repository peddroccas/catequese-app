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
import { useContext } from 'react'
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
  return (
    <Table
      aria-label="Catequizandos"
      classNames={{
        wrapper: 'bg-bunker-900',
        th: 'bg-bunker-300 text-bunker-950',
        base: 'rounded-xl shadow shadow-black',
      }}
    >
      <TableHeader>
        <TableColumn align="start" className="flex-1">
          NOME
        </TableColumn>
        <TableColumn align="center" hidden={hasPageClassroomInfo}>
          TURMA
        </TableColumn>
        <TableColumn align="center" hidden={hasPageClassroomInfo}>
          CATEQUISTA
        </TableColumn>
        <TableColumn align="center">CARNÊ</TableColumn>
        <TableColumn align="center">BATISMO</TableColumn>
        <TableColumn align="center">1° EUCARISTIA</TableColumn>
        <TableColumn align="center" className="w-fit">
          AÇÕES
        </TableColumn>
      </TableHeader>
      <TableBody>
        {catechizings.map((catechizing) => {
          const classroom = classrooms.find(
            (classroom) => classroom.id === catechizing.classroomId,
          )
          const { catechists } = classroom!

          return (
            <TableRow key={catechizing.id}>
              <TableCell>{catechizing.name}</TableCell>
              <TableCell hidden={hasPageClassroomInfo}>
                {classroom?.roomNumber}
              </TableCell>
              <TableCell hidden={hasPageClassroomInfo}>
                {catechists
                  ?.map((catechist) => catechist.name.split(' ')[0])
                  .join(' e ')}
              </TableCell>
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
