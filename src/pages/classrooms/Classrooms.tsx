import { ClassroomList } from '@/components/ClassroomList'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { useClassroomDetails } from '@/hooks/useClassroomDetails'
import { Button } from '@nextui-org/react'
import { Plus } from '@phosphor-icons/react'
import { useContext, useState } from 'react'
import { AddNewClassroomModal } from './components/modals/AddNewClassroomModal'
import { ClassroomView } from './components/ClassroomView'
import { segments } from '@/Types'

export function Classrooms() {
  const { classrooms } = useContext(ClassroomContext)
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>()
  const [isUserAddingNewClassroom, setIsUserAddingNewClassroom] =
    useState<boolean>(false)

  // Abre a primeira turma (na ordem dos segmentos) e, se a selecionada for
  // apagada, volta para ela
  const firstClassroom = segments
    .flatMap((segment) =>
      classrooms.filter((classroom) => classroom.segment === segment),
    )
    .at(0)
  const selectedId = classrooms.some(
    (classroom) => classroom.id === selectedClassroomId,
  )
    ? selectedClassroomId
    : firstClassroom?.id
  const classroom = useClassroomDetails(selectedId)

  return (
    <div className="flex flex-grow flex-col gap-6 md:flex-row md:items-start">
      <AddNewClassroomModal
        isOpen={isUserAddingNewClassroom}
        onClose={() => setIsUserAddingNewClassroom(false)}
      />
      <aside className="space-y-3 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:w-56 md:shrink-0 md:overflow-y-auto lg:w-64">
        <Button
          onPress={() => setIsUserAddingNewClassroom(true)}
          color="primary"
          startContent={<Plus size={18} />}
          className="w-full"
        >
          Nova turma
        </Button>
        <ClassroomList
          classrooms={classrooms}
          selectedClassroomId={selectedId}
          onSelect={(classroom) => setSelectedClassroomId(classroom.id)}
        />
      </aside>
      <main className="min-w-0 flex-1">
        {classroom && classroom.id === selectedId && (
          <ClassroomView classroom={classroom} />
        )}
      </main>
    </div>
  )
}
