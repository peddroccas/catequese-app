import { ClassroomList } from '@/components/ClassroomList'
import { ConfirmModal } from '@/components/ConfirmModal'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { useClassroomDetails } from '@/hooks/useClassroomDetails'
import { CatechizingsTable } from '@/pages/catechizings/components/CatechizingsTable'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { classroom, isAdultSegment } from '@/Types'
import { formatTimestamp } from '@/utils/date'
import { downloadClassroomPdf } from '@/utils/pdf'
import { matchesSearch } from '@/utils/search'
import { Button, Chip } from '@nextui-org/react'
import { ArrowCounterClockwise, FilePdf, Trash } from '@phosphor-icons/react'
import { useState } from 'react'

interface ArchivedClassroomsProps {
  classrooms: classroom[]
  onChange: () => Promise<void>
}

export function ArchivedClassrooms({
  classrooms,
  onChange,
}: ArchivedClassroomsProps) {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>()
  const [search, setSearch] = useState<string>('')
  const [isRestoring, setIsRestoring] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const selectedId = classrooms.some(
    (classroom) => classroom.id === selectedClassroomId,
  )
    ? selectedClassroomId
    : classrooms[0]?.id
  const classroom = useClassroomDetails(selectedId)

  if (!classrooms.length) {
    return <p className="text-sm text-bunker-500">Nenhuma turma arquivada.</p>
  }

  const catechizings = (classroom?.catechizings ?? []).filter((catechizing) =>
    matchesSearch(catechizing.name, search),
  )

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <aside className="md:sticky md:top-24 md:w-56 md:shrink-0 lg:w-64">
        <ClassroomList
          classrooms={classrooms}
          selectedClassroomId={selectedId}
          onSelect={(classroom) => setSelectedClassroomId(classroom.id)}
        />
      </aside>
      {classroom && classroom.id === selectedId && (
        <section className="flex min-w-0 flex-1 flex-col gap-5">
          <ConfirmModal
            isOpen={isRestoring}
            onClose={() => setIsRestoring(false)}
            title="Restaurar turma?"
            confirmLabel="Restaurar"
            onConfirm={async () => {
              await ClassroomRepository.restoreClassroom(classroom.id!)
              await onChange()
            }}
          >
            <p>
              <strong>{classroom.name}</strong> volta para as turmas ativas
              junto com os {classroom.catechizings?.length ?? 0} catequizandos
              que foram arquivados com ela.
            </p>
          </ConfirmModal>
          <ConfirmModal
            isOpen={isDeleting}
            onClose={() => setIsDeleting(false)}
            title="Excluir turma de vez?"
            confirmLabel="Excluir de vez"
            color="danger"
            onConfirm={async () => {
              await ClassroomRepository.deleteClassroom(classroom.id!)
              await onChange()
            }}
          >
            <p>
              A turma <strong>{classroom.name}</strong> e os{' '}
              {classroom.catechizings?.length ?? 0} catequizandos dela serão
              apagados permanentemente. Isso não pode ser desfeito.
            </p>
          </ConfirmModal>

          <PageHeader
            title={classroom.name ?? classroom.location}
            description={
              <span className="flex flex-wrap items-center gap-2">
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: 'bg-bunker-100',
                    content: 'font-medium text-bunker-700',
                  }}
                >
                  {classroom.segment}
                </Chip>
                <span>Início em {classroom.startedAt}</span>
                <span aria-hidden>·</span>
                <span>
                  Arquivada em {formatTimestamp(classroom.archivedAt)}
                </span>
              </span>
            }
          >
            <IconButton
              label="Gerar PDF com os dados dos catequizandos"
              icon={<FilePdf size={20} />}
              onPress={() => downloadClassroomPdf(classroom)}
            />
            <Button
              color="primary"
              variant="flat"
              startContent={<ArrowCounterClockwise size={18} />}
              onPress={() => setIsRestoring(true)}
            >
              Restaurar
            </Button>
            <Button
              color="danger"
              variant="light"
              startContent={<Trash size={18} />}
              onPress={() => setIsDeleting(true)}
            >
              Excluir de vez
            </Button>
          </PageHeader>
          <p className="text-sm text-bunker-600">
            Catequistas:{' '}
            {classroom.catechists
              ?.map((catechist) => catechist.name)
              .join(', ') || 'nenhum'}
          </p>
          <SearchInput value={search} onChange={setSearch} />
          <CatechizingsTable
            catechizings={catechizings}
            hasPageClassroomInfo
            isAdultClassroom={isAdultSegment(classroom.segment)}
            isReadOnly
          />
        </section>
      )}
    </div>
  )
}
