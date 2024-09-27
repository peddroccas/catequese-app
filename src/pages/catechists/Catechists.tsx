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
import { UserPlus } from '@phosphor-icons/react'
import { useContext, useState } from 'react'
import { AddNewCatechistModal } from './components/modals/AddNewCatechistModal'
import ToolBar from './components/ToolBar'

export function Catechists() {
  const { catechists, classrooms } = useContext(ClassroomContext)

  const [isUserAddingNewCatechist, setIsUserAddingNewCatechist] =
    useState<boolean>(false)

  return (
    <div className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
      <nav className="flex items-center justify-between">
        <AddNewCatechistModal
          isOpen={isUserAddingNewCatechist}
          onClose={() => setIsUserAddingNewCatechist(false)}
        />
        <h1 className="text-2xl">Catequistas</h1>
        <Tooltip
          content="Adicionar novo catequista"
          className="text-bunker-950"
          closeDelay={0}
        >
          <Button
            isIconOnly
            onPress={() => setIsUserAddingNewCatechist(true)}
            className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
          >
            <UserPlus size={28} className="text-white" />
          </Button>
        </Tooltip>
      </nav>
      {catechists && (
        <Table
          aria-label="Catequistas"
          classNames={{
            wrapper: 'bg-bunker-900',
            th: 'bg-bunker-300 text-bunker-950',
          }}
        >
          <TableHeader>
            <TableColumn align="start">NOME</TableColumn>
            <TableColumn align="center">TURMA</TableColumn>
            <TableColumn align="center">AÇÕES</TableColumn>
          </TableHeader>
          <TableBody>
            {catechists.map((catechist) => {
              const classroom = classrooms.find(
                (classroom) => classroom.id === catechist.classroomId,
              )
              return (
                <TableRow key={catechist.id}>
                  <TableCell>{catechist.name}</TableCell>
                  <TableCell>{classroom?.roomNumber}</TableCell>
                  <TableCell>
                    <ToolBar catechist={catechist} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
