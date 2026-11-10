import { useAuth } from '@/hooks/useAuth'
import { useContext, useState } from 'react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { useClassroomDetails } from '@/hooks/useClassroomDetails'
import { ClassroomList } from '@/components/ClassroomList'
import { ClassroomView } from '../classrooms/components/ClassroomView'

// Turmas do catequista logado (pode estar em mais de uma)
export function Classroom() {
  const { user } = useAuth()
  const { classrooms } = useContext(ClassroomContext)
  const myClassrooms = classrooms.filter((classroom) =>
    user?.classroomIds.includes(classroom.id!),
  )
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>()
  const selectedId = selectedClassroomId ?? myClassrooms[0]?.id
  const classroom = useClassroomDetails(selectedId)

  if (!myClassrooms.length) {
    return (
      <main className="flex flex-grow flex-col gap-6">
        <p className="text-2xl">Você ainda não está em nenhuma turma.</p>
      </main>
    )
  }

  return (
    <div className="flex flex-grow flex-col gap-6 md:flex-row md:items-start">
      {myClassrooms.length > 1 && (
        <aside className="md:sticky md:top-24 md:w-56 md:shrink-0 lg:w-64">
          <ClassroomList
            classrooms={myClassrooms}
            selectedClassroomId={selectedId}
            onSelect={(classroom) => setSelectedClassroomId(classroom.id)}
          />
        </aside>
      )}
      <main className="min-w-0 flex-1">
        {classroom && classroom.id === selectedId && (
          <ClassroomView classroom={classroom} />
        )}
      </main>
    </div>
  )
}
