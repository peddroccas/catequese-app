import { useAuth } from '@/hooks/useAuth'
import { useContext, useState } from 'react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { useClassroomDetails } from '@/hooks/useClassroomDetails'
import { ClassroomList } from '@/components/ClassroomList'
import { ClassroomView } from '../classrooms/components/ClassroomView'

// Turmas do catequista logado (pode estar em mais de uma)
export default function Classroom() {
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
      <main className="mx-4 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4 sm:mx-10">
        <p className="text-2xl">Você ainda não está em nenhuma turma.</p>
      </main>
    )
  }

  return (
    <div className="mx-4 mt-4 flex flex-grow flex-col gap-6 pb-8 pt-4 sm:mx-10 lg:flex-row lg:items-start">
      {myClassrooms.length > 1 && (
        <aside className="lg:sticky lg:top-24 lg:w-60 lg:shrink-0">
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
