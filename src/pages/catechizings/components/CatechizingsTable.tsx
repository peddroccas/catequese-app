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

interface CatechizingsTableProps {
  catechizings: catechizing[]
}

export function CatechizingsTable({ catechizings }: CatechizingsTableProps) {
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
        <TableColumn align="start" className="w-max">
          NOME
        </TableColumn>
        <TableColumn align="center">CARNÊ</TableColumn>
        <TableColumn align="center">BATISMO</TableColumn>
        <TableColumn align="center">1° EUCARISTIA</TableColumn>
        <TableColumn align="center">AÇÕES</TableColumn>
      </TableHeader>
      <TableBody>
        {catechizings.map((catechizing) => (
          <TableRow key={catechizing.id}>
            <TableCell>{catechizing.name}</TableCell>
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
              <p>123</p>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
