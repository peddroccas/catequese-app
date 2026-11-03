import { ClassroomContext } from '@/contexts/ClassroomContext'
import { getErrorMessage } from '@/services/api'
import { FormationRepository } from '@/services/repositories/formationRepository'
import { formation } from '@/Types'
import { formatDate } from '@/utils/date'
import { downloadFormationPdf } from '@/utils/pdf'
import { SearchInput } from '@/components/SearchInput'
import { matchesSearch } from '@/utils/search'
import { tableClassNames } from '@/components/tableStyles'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@nextui-org/react'
import { FilePdf, PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { FormationModal } from './components/FormationModal'

export function Formations() {
  const { catechists } = useContext(ClassroomContext)
  const [formations, setFormations] = useState<formation[]>([])
  const [search, setSearch] = useState<string>('')
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [editing, setEditing] = useState<formation>()
  const [deleting, setDeleting] = useState<formation>()

  const loadFormations = useCallback(() => {
    FormationRepository.getAllFormations()
      .then(setFormations)
      .catch((error) => alert(getErrorMessage(error)))
  }, [])

  useEffect(() => {
    loadFormations()
  }, [loadFormations])

  async function handleDelete() {
    try {
      await FormationRepository.deleteFormation(deleting!.id!)
      setDeleting(undefined)
      loadFormations()
    } catch (error) {
      alert(getErrorMessage(error))
    }
  }

  const filteredFormations = formations.filter((formation) =>
    matchesSearch(formation.theme, search),
  )

  return (
    <div className="mx-4 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4 sm:mx-10">
      {isAdding && (
        <FormationModal
          isOpen
          onClose={() => setIsAdding(false)}
          onSaved={loadFormations}
        />
      )}
      {editing && (
        <FormationModal
          isOpen
          data={editing}
          onClose={() => setEditing(undefined)}
          onSaved={loadFormations}
        />
      )}
      <Modal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        className="bg-bunker-900"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>Deseja realmente deletar a formação?</ModalHeader>
          <ModalBody>
            {deleting?.theme} – {formatDate(deleting?.date)}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setDeleting(undefined)}>
              Cancelar
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Deletar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <nav className="flex flex-col items-center justify-between gap-8 sm:flex-row">
        <h1 className="text-3xl">Formações</h1>
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar tema"
          />
          <Tooltip
            content="Nova formação"
            className="text-bunker-950"
            closeDelay={0}
          >
            <Button
              isIconOnly
              aria-label="Nova formação"
              onPress={() => setIsAdding(true)}
              className="bg-bunker-900 shadow shadow-black *:duration-300 *:hover:text-green-500"
            >
              <Plus size={28} className="text-white" />
            </Button>
          </Tooltip>
        </div>
      </nav>

      <Table aria-label="Formações" classNames={tableClassNames}>
        <TableHeader>
          <TableColumn align="center">DATA</TableColumn>
          <TableColumn align="start">TEMA</TableColumn>
          <TableColumn align="center">PRESENTES</TableColumn>
          <TableColumn align="center">FALTAS</TableColumn>
          <TableColumn align="center">AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhuma formação cadastrada">
          {filteredFormations.map((formation) => {
            const present = formation.attendances.filter(
              (attendance) => attendance.isPresent,
            ).length
            return (
              <TableRow key={formation.id}>
                <TableCell>{formatDate(formation.date)}</TableCell>
                <TableCell>{formation.theme}</TableCell>
                <TableCell>{present}</TableCell>
                <TableCell>{formation.attendances.length - present}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip
                      content="Baixar PDF da chamada"
                      className="text-bunker-950"
                      closeDelay={0}
                    >
                      <FilePdf
                        size={20}
                        className="cursor-pointer duration-300 hover:text-green-500"
                        onClick={() =>
                          downloadFormationPdf(formation, catechists)
                        }
                      />
                    </Tooltip>
                    <Tooltip
                      content="Editar"
                      className="text-bunker-950"
                      closeDelay={0}
                    >
                      <PencilSimple
                        size={20}
                        className="cursor-pointer duration-300 hover:opacity-60"
                        onClick={() => setEditing(formation)}
                      />
                    </Tooltip>
                    <Tooltip
                      content="Deletar"
                      className="text-bunker-950"
                      closeDelay={0}
                    >
                      <Trash
                        size={20}
                        className="cursor-pointer duration-300 hover:text-red-500"
                        onClick={() => setDeleting(formation)}
                      />
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
