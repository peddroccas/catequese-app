import { ClassroomList } from '@/components/ClassroomList'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { useAuth } from '@/hooks/useAuth'
import { useClassroomDetails } from '@/hooks/useClassroomDetails'
import { segments } from '@/Types'
import { Button } from '@nextui-org/react'
import { ListBullets } from '@phosphor-icons/react'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClassroomMeetings } from './components/ClassroomMeetings'

// Chamadas dos encontros: a coordenação vê todas as turmas, o catequista
// só as suas
export function Meetings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { classrooms } = useContext(ClassroomContext)
  const isCoordinator = user?.role === 'COORDINATOR'
  const visibleClassrooms = isCoordinator
    ? classrooms
    : classrooms.filter((classroom) =>
        user?.classroomIds.includes(classroom.id!),
      )
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>()

  const firstClassroom = segments
    .flatMap((segment) =>
      visibleClassrooms.filter((classroom) => classroom.segment === segment),
    )
    .at(0)
  const selectedId = visibleClassrooms.some(
    (classroom) => classroom.id === selectedClassroomId,
  )
    ? selectedClassroomId
    : firstClassroom?.id
  const classroom = useClassroomDetails(selectedId)

  const themesButton = isCoordinator && (
    <Button
      variant="bordered"
      startContent={<ListBullets size={18} />}
      onPress={() => navigate('/meeting-themes')}
      className="w-full border-1 border-bunker-200 bg-white font-medium text-bunker-700 shadow-sm"
    >
      Temas dos encontros
    </Button>
  )

  if (!visibleClassrooms.length) {
    return (
      <main className="flex flex-grow flex-col gap-6">
        <p className="text-2xl">
          {isCoordinator
            ? 'Nenhuma turma cadastrada.'
            : 'Você ainda não está em nenhuma turma.'}
        </p>
      </main>
    )
  }

  return (
    <div className="flex flex-grow flex-col gap-6 md:flex-row md:items-start">
      {(visibleClassrooms.length > 1 || isCoordinator) && (
        <aside className="scrollbar-thin space-y-3 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:w-56 md:shrink-0 md:overflow-y-auto md:pr-2 lg:w-64">
          {themesButton}
          <ClassroomList
            classrooms={visibleClassrooms}
            selectedClassroomId={selectedId}
            onSelect={(classroom) => setSelectedClassroomId(classroom.id)}
          />
        </aside>
      )}
      <main className="min-w-0 flex-1">
        {classroom && classroom.id === selectedId && (
          <ClassroomMeetings key={classroom.id} classroom={classroom} />
        )}
      </main>
    </div>
  )
}
