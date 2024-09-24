import { ClassroomSelect } from '@/components/ClassroomSelect'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ToolBar } from '@/pages/classrooms/components/ToolBar'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { classroom } from '@/Types'
import { useContext, useEffect, useState } from 'react'
import { CatechizingsTable } from '../catechizings/components/CatechizingsTable'
import { classroomInitialState } from '@/reducer/classroom/classroomReducer'

export function Classrooms() {
  const { classrooms, hasClassroomUpdate, throwClassroomHasAlreadyUpdated } =
    useContext(ClassroomContext)
  const [classroom, setClassroom] = useState<classroom>(classroomInitialState)
  const [selectedClassroom, setSelectedClassroom] = useState<classroom>(
    {} as classroom,
  )

  useEffect(() => {
    async function getClassroom() {
      if (selectedClassroom.id) {
        const classroom = await ClassroomRepository.getClassroom(
          selectedClassroom.id,
        )
        if (classroom) {
          setClassroom(classroom)
        } else {
          setClassroom({} as classroom)
          setSelectedClassroom({} as classroom)
        }
      }
    }
    getClassroom().finally(throwClassroomHasAlreadyUpdated)
  }, [
    classrooms,
    selectedClassroom,
    hasClassroomUpdate,
    throwClassroomHasAlreadyUpdated,
  ])
  const { catechizings } = classroom

  return (
    <div className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
      <nav className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <ClassroomSelect
          value={selectedClassroom!}
          onChange={(e) =>
            setSelectedClassroom(
              classrooms.find((classroom) => classroom.id === e.target.value)!,
            )
          }
        />
        <ToolBar
          isClassroomSelected={Boolean(classroom.id)}
          classroom={classroom}
        />
      </nav>
      {classroom.id && (
        <CatechizingsTable
          catechizings={catechizings!}
          hasPageClassroomInfo={true}
        />
      )}
    </div>
  )
}
