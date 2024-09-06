import { ClassroomContext } from '@/contexts/ClassroomContext'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Tooltip,
} from '@nextui-org/react'
import { Check, UserPlus, X } from '@phosphor-icons/react'
import { useContext, useState } from 'react'
import { AddNewCatechizingModal } from './components/AddNewCatechizingModal'

export function Catechizings() {
  const { catechizings } = useContext(ClassroomContext)

  const [isUserAddingNewCatechizing, setIsUserAddingNewCatechizing] =
    useState<boolean>(false)

  return (
    <div className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
      <nav className="flex items-center justify-between">
        <AddNewCatechizingModal
          isOpen={isUserAddingNewCatechizing}
          onClose={() => setIsUserAddingNewCatechizing(false)}
        />
        <h1 className="text-2xl">Catequizandos</h1>
        <Tooltip
          content="Adicionar novo catequista"
          className="text-bunker-950"
          closeDelay={0}
        >
          <Button
            isIconOnly
            onPress={() => setIsUserAddingNewCatechizing(true)}
            className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
          >
            <UserPlus size={28} className="text-white" />
          </Button>
        </Tooltip>
      </nav>
      {catechizings && (
        <Table
          aria-label="Catequistas"
          classNames={{
            wrapper: 'bg-bunker-900',
            th: 'bg-bunker-300 text-bunker-950',
          }}
        >
          <TableHeader>
            <TableColumn align="start" className="w-max">
              NOME
            </TableColumn>
            <TableColumn align="center">FALTA PAGAR</TableColumn>
            <TableColumn align="center">BATISMO</TableColumn>
            <TableColumn align="center">1° EUCARISTIA</TableColumn>
          </TableHeader>
          <TableBody>
            {catechizings.map((catechizing) => (
              <TableRow key={catechizing.id}>
                <TableCell>{catechizing.name}</TableCell>
                <TableCell>{catechizing.payments![0].toBePaid}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
