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
import { SearchInput } from '@/components/SearchInput'
import { matchesSearch } from '@/utils/search'
import { tableClassNames } from '@/components/tableStyles'
import { calculateAge, formatDate } from '@/utils/date'
import { maskPhone } from '@/utils/phone'

export function Catechists() {
  const { catechists, classrooms } = useContext(ClassroomContext)
  const [search, setSearch] = useState<string>('')

  const [isUserAddingNewCatechist, setIsUserAddingNewCatechist] =
    useState<boolean>(false)

  const filteredCatechists = catechists.filter(
    (catechist) =>
      matchesSearch(catechist.name, search) ||
      matchesSearch(catechist.nickname, search),
  )

  return (
    <div className="mx-4 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4 sm:mx-10">
      <nav className="flex flex-col items-center justify-between gap-8 sm:flex-row">
        <AddNewCatechistModal
          isOpen={isUserAddingNewCatechist}
          onClose={() => setIsUserAddingNewCatechist(false)}
        />
        <h1 className="text-3xl">Catequistas</h1>
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar catequista"
          />
          <Tooltip
            content="Adicionar novo catequista"
            className="text-bunker-950"
            closeDelay={0}
          >
            <Button
              isIconOnly
              aria-label="Adicionar novo catequista"
              onPress={() => setIsUserAddingNewCatechist(true)}
              className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
            >
              <UserPlus size={28} className="text-white" />
            </Button>
          </Tooltip>
        </div>
      </nav>
      <Table aria-label="Catequistas" classNames={tableClassNames}>
        <TableHeader>
          <TableColumn align="center">Nº</TableColumn>
          <TableColumn align="start">NOME</TableColumn>
          <TableColumn align="start">EMAIL</TableColumn>
          <TableColumn align="center">TELEFONE</TableColumn>
          <TableColumn align="center">NASCIMENTO</TableColumn>
          <TableColumn align="center">IDADE</TableColumn>
          <TableColumn align="center">TURMAS</TableColumn>
          <TableColumn align="center">FUNÇÃO</TableColumn>
          <TableColumn align="center">AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum catequista encontrado">
          {filteredCatechists.map((catechist, index) => {
            const catechistClassrooms = classrooms.filter((classroom) =>
              catechist.classroomIds.includes(classroom.id!),
            )
            return (
              <TableRow key={catechist.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{catechist.name}</TableCell>
                <TableCell>{catechist.email}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {maskPhone(catechist.phone) || '-'}
                </TableCell>
                <TableCell>{formatDate(catechist.birthday)}</TableCell>
                <TableCell>{calculateAge(catechist.birthday) ?? '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-center">
                    {catechistClassrooms.length
                      ? catechistClassrooms.map((classroom) => (
                          <span key={classroom.id}>
                            {classroom.location} ({classroom.segment})
                          </span>
                        ))
                      : '-'}
                  </div>
                </TableCell>
                <TableCell>
                  {catechist.role === 'COORDINATOR' ? 'Coordenador' : 'Membro'}
                </TableCell>
                <TableCell>
                  <ToolBar catechist={catechist} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
