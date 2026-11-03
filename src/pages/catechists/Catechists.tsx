import { ClassroomContext } from '@/contexts/ClassroomContext'
import { DragScroll } from '@/components/DragScroll'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
} from '@nextui-org/react'
import { PageHeader } from '@/components/PageHeader'
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
    <div className="flex flex-grow flex-col gap-6">
      <AddNewCatechistModal
        isOpen={isUserAddingNewCatechist}
        onClose={() => setIsUserAddingNewCatechist(false)}
      />
      <PageHeader
        title="Catequistas"
        description={`${catechists.length} catequistas cadastrados`}
      >
        <Button
          color="primary"
          startContent={<UserPlus size={18} />}
          onPress={() => setIsUserAddingNewCatechist(true)}
        >
          Novo catequista
        </Button>
      </PageHeader>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Pesquisar catequista"
      />
      <DragScroll>
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
                    {maskPhone(catechist.phone) || '-'}
                  </TableCell>
                  <TableCell>{formatDate(catechist.birthday)}</TableCell>
                  <TableCell>
                    {calculateAge(catechist.birthday) ?? '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-center gap-1">
                      {catechistClassrooms.length ? (
                        catechistClassrooms.map((classroom) => (
                          <Chip
                            key={classroom.id}
                            size="sm"
                            variant="flat"
                            title={classroom.segment}
                            classNames={{
                              base: 'bg-bunker-100',
                              content: 'whitespace-nowrap text-bunker-700',
                            }}
                          >
                            {classroom.location}
                          </Chip>
                        ))
                      ) : (
                        <span className="text-bunker-300">–</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      classNames={{
                        base:
                          catechist.role === 'COORDINATOR'
                            ? 'bg-bunker-800'
                            : 'bg-bunker-100',
                        content: `font-medium ${catechist.role === 'COORDINATOR' ? 'text-white' : 'text-bunker-700'}`,
                      }}
                    >
                      {catechist.role === 'COORDINATOR'
                        ? 'Coordenador'
                        : 'Membro'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <ToolBar catechist={catechist} />
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
