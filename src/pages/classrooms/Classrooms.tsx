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
    <div className="mx-4 mt-4 flex flex-grow flex-col gap-6 pb-8 pt-4 sm:mx-10 lg:flex-row lg:items-start">
      <AddNewClassroomModal
        isOpen={isUserAddingNewClassroom}
        onClose={() => setIsUserAddingNewClassroom(false)}
      />
      <aside className="space-y-3 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:w-60 lg:shrink-0 lg:overflow-y-auto">
        <Button
          onPress={() => setIsUserAddingNewClassroom(true)}
          startContent={<Plus size={18} />}
          className="bg-bunker-900 text-white shadow shadow-black"
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
