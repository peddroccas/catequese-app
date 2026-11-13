import { toast } from '@/lib/toast'
import { DragScroll } from '@/components/DragScroll'
import { RowAction } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { tableClassNames } from '@/components/tableStyles'
import { getErrorMessage } from '@/services/api'
import { MeetingRepository } from '@/services/repositories/meetingRepository'
import { classroom, meeting, meetingTheme, segmentItinerary } from '@/Types'
import { formatDate } from '@/utils/date'
import { downloadMeetingPdf } from '@/utils/pdf'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from '@nextui-org/react'
import { FilePdf, PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { SegmentChip } from '@/components/SegmentChip'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AttendanceMatrix } from './AttendanceMatrix'
import { MeetingModal } from './MeetingModal'

interface ClassroomMeetingsProps {
  classroom: classroom
}

interface absenceRow {
  catechizingId: string
  name: string
  present: number
  absent: number
  isInClassroom: boolean
}

// Encontros de uma turma, com a chamada e o resumo de faltas
export function ClassroomMeetings({ classroom }: ClassroomMeetingsProps) {
  const itinerary = classroom.segment
    ? segmentItinerary[classroom.segment]
    : undefined
  const [meetings, setMeetings] = useState<meeting[]>([])
  const [themes, setThemes] = useState<meetingTheme[]>([])
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [editing, setEditing] = useState<meeting>()
  const [deleting, setDeleting] = useState<meeting>()

  const loadMeetings = useCallback(() => {
    MeetingRepository.getClassroomMeetings(classroom.id!)
      .then(setMeetings)
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [classroom.id])

  useEffect(() => {
    setMeetings([])
    loadMeetings()
  }, [loadMeetings])

  useEffect(() => {
    if (!itinerary) {
      return
    }
    MeetingRepository.getThemes(itinerary)
      .then(setThemes)
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [itinerary])

  // Temas já trabalhados (sem contar o encontro que está sendo editado)
  const usedThemeIds = useMemo(
    () =>
      new Set(
        meetings
          .filter((meeting) => meeting.id !== editing?.id)
          .flatMap((meeting) => meeting.themes.map((theme) => theme.id)),
      ),
    [meetings, editing?.id],
  )
  const coveredCount = themes.filter((theme) =>
    meetings.some((meeting) =>
      meeting.themes.some((item) => item.id === theme.id),
    ),
  ).length

  // Faltas de cada catequizando; inclui quem já saiu da turma
  const absences = useMemo(() => {
    const rows = new Map<string, absenceRow>()
    for (const catechizing of classroom.catechizings ?? []) {
      rows.set(catechizing.id!, {
        catechizingId: catechizing.id!,
        name: catechizing.name,
        present: 0,
        absent: 0,
        isInClassroom: true,
      })
    }
    for (const meeting of meetings) {
      for (const attendance of meeting.attendances) {
        const row = rows.get(attendance.catechizingId) ?? {
          catechizingId: attendance.catechizingId,
          name: attendance.catechizingName ?? 'Catequizando removido',
          present: 0,
          absent: 0,
          isInClassroom: false,
        }
        if (attendance.isPresent) {
          row.present++
        } else {
          row.absent++
        }
        rows.set(attendance.catechizingId, row)
      }
    }
    return [...rows.values()].sort(
      (a, b) =>
        Number(b.isInClassroom) - Number(a.isInClassroom) ||
        a.name.localeCompare(b.name),
    )
  }, [classroom.catechizings, meetings])

  async function handleDelete() {
    try {
      await MeetingRepository.deleteMeeting(deleting!.id!)
      setDeleting(undefined)
      loadMeetings()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <section className="flex flex-col gap-5">
      {(isAdding || editing) && (
        <MeetingModal
          classroom={classroom}
          themes={themes}
          usedThemeIds={usedThemeIds}
          data={editing}
          onClose={() => {
            setIsAdding(false)
            setEditing(undefined)
          }}
          onSaved={loadMeetings}
        />
      )}
      <Modal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>Deseja realmente deletar a chamada?</ModalHeader>
          <ModalBody>
            <p>Encontro de {formatDate(deleting?.date)}</p>
            <ul className="list-disc pl-5 text-sm text-bunker-600">
              {deleting?.themes.map((theme) => (
                <li key={theme.id}>{theme.name}</li>
              ))}
            </ul>
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
        title={`Chamadas · ${classroom.name ?? classroom.location}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <SegmentChip segment={classroom.segment} />
            <span>
              {meetings.length} encontro{meetings.length === 1 ? '' : 's'}
            </span>
            {themes.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>
                  {coveredCount} de {themes.length} temas do itinerário
                </span>
              </>
            )}
          </span>
        }
      >
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={() => setIsAdding(true)}
        >
          Nova chamada
        </Button>
      </PageHeader>

      <Tabs
        aria-label="Chamadas da turma"
        variant="underlined"
        classNames={{
          tabList: 'gap-6 border-b border-bunker-200 p-0',
          cursor: 'bg-bunker-800',
          tab: 'h-11 px-0',
          tabContent:
            'font-medium text-bunker-500 group-data-[selected=true]:text-bunker-900',
          panel: 'px-0 pt-5',
        }}
      >
        <Tab key="meetings" title="Encontros">
          <DragScroll>
            <Table aria-label="Encontros" classNames={tableClassNames}>
              <TableHeader>
                <TableColumn align="center">DATA</TableColumn>
                <TableColumn align="start">TEMAS</TableColumn>
                <TableColumn align="center">PRESENTES</TableColumn>
                <TableColumn align="center">FALTAS</TableColumn>
                <TableColumn align="center">AÇÕES</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Nenhuma chamada registrada">
                {meetings.map((meeting) => {
                  const present = meeting.attendances.filter(
                    (attendance) => attendance.isPresent,
                  ).length
                  return (
                    <TableRow key={meeting.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(meeting.date)}
                      </TableCell>
                      <TableCell>
                        <ul className="flex min-w-64 flex-col gap-0.5">
                          {meeting.themes.map((theme) => (
                            <li
                              key={theme.id}
                              className="font-medium text-bunker-900"
                            >
                              {theme.name}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium tabular-nums text-emerald-600">
                          {present}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium tabular-nums text-red-500">
                          {meeting.attendances.length - present}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-0.5">
                          <RowAction
                            label="Baixar PDF da chamada"
                            icon={<FilePdf size={18} />}
                            onPress={() =>
                              downloadMeetingPdf(meeting, classroom)
                            }
                          />
                          <RowAction
                            label="Editar"
                            icon={<PencilSimple size={18} />}
                            onPress={() => setEditing(meeting)}
                          />
                          <RowAction
                            label="Deletar"
                            variant="danger"
                            icon={<Trash size={18} />}
                            onPress={() => setDeleting(meeting)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </DragScroll>
        </Tab>
        <Tab key="matrix" title="Mapa de frequência">
          <AttendanceMatrix classroom={classroom} meetings={meetings} />
        </Tab>
        <Tab key="absences" title="Faltas por catequizando">
          <DragScroll>
            <Table
              aria-label="Faltas por catequizando"
              classNames={tableClassNames}
            >
              <TableHeader>
                <TableColumn align="start">CATEQUIZANDO</TableColumn>
                <TableColumn align="center">PRESENÇAS</TableColumn>
                <TableColumn align="center">FALTAS</TableColumn>
                <TableColumn align="center">FREQUÊNCIA</TableColumn>
              </TableHeader>
              <TableBody emptyContent="A turma ainda não tem catequizandos">
                {absences.map((row) => {
                  const total = row.present + row.absent
                  return (
                    <TableRow key={row.catechizingId}>
                      <TableCell>
                        <span className="font-medium text-bunker-900">
                          {row.name}
                        </span>
                        {!row.isInClassroom && (
                          <span className="ml-2 text-xs text-bunker-400">
                            (saiu da turma)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium tabular-nums text-emerald-600">
                          {row.present}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium tabular-nums text-red-500">
                          {row.absent}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="tabular-nums">
                          {total
                            ? `${Math.round((row.present / total) * 100)}%`
                            : '–'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </DragScroll>
        </Tab>
      </Tabs>
    </section>
  )
}
