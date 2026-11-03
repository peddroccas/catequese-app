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
} from '@nextui-org/react'
import { PageHeader } from '@/components/PageHeader'
import { RowAction } from '@/components/IconButton'
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
    <div className="flex flex-grow flex-col gap-6">
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

      <PageHeader
        title="Formações"
        description="Encontros de formação e chamada dos catequistas"
      >
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={() => setIsAdding(true)}
        >
          Nova formação
        </Button>
      </PageHeader>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Pesquisar tema"
      />

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
                <TableCell>
                  <span className="font-medium text-bunker-900">
                    {formation.theme}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium tabular-nums text-emerald-600">
                    {present}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium tabular-nums text-red-500">
                    {formation.attendances.length - present}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-0.5">
                    <RowAction
                      label="Baixar PDF da chamada"
                      icon={<FilePdf size={18} />}
                      onPress={() =>
                        downloadFormationPdf(formation, catechists)
                      }
                    />
                    <RowAction
                      label="Editar"
                      icon={<PencilSimple size={18} />}
                      onPress={() => setEditing(formation)}
                    />
                    <RowAction
                      label="Deletar"
                      variant="danger"
                      icon={<Trash size={18} />}
                      onPress={() => setDeleting(formation)}
                    />
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
