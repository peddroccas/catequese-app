import { ClassroomSelect } from '@/components/ClassroomSelect'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ToolBar } from '@/pages/classrooms/components/ToolBar'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { classroom } from '@/Types'
import { useContext, useEffect, useState } from 'react'
import { CatechizingsTable } from '../catechizings/components/CatechizingsTable'

export function Classrooms() {
  const { classrooms, hasClassroomUpdate, throwClassroomHasAlreadyUpdated } =
    useContext(ClassroomContext)
  const [classroom, setClassroom] = useState<classroom>({} as classroom)
  const [selectedClassroom, setSelectedClassroom] = useState<{
    id: string
    classroomName: string
    startedAt: number
  }>(
    {} as {
      id: string
      classroomName: string
      startedAt: number
    },
  )
  const { catechizings } = classroom

  useEffect(() => {
    async function getClassroom() {
      if (selectedClassroom.id) {
        const classroom = await ClassroomRepository.getClassroom(
          selectedClassroom.id,
        )
        setClassroom(classroom)
      }
    }
    getClassroom().finally(throwClassroomHasAlreadyUpdated)
  }, [
    classrooms,
    selectedClassroom,
    hasClassroomUpdate,
    throwClassroomHasAlreadyUpdated,
  ])

  return (
    <div className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
      <nav className="flex items-center justify-between">
        <ClassroomSelect
          value={selectedClassroom!}
          onChange={(e) =>
            setSelectedClassroom(
              classrooms.find((classroom) => classroom.id === e.target.value)!,
            )
          }
        />
        <ToolBar isClassroomSelected={Boolean(classroom.id)} />
      </nav>
      {classroom.id && <CatechizingsTable catechizings={catechizings!} />}
    </div>
  )
}
