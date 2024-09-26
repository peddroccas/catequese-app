import catequeseLogo from '@/assets/catequese-logo.svg'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@nextui-org/react'
import { CatechizingsTable } from '../catechizings/components/CatechizingsTable'
import { useContext, useEffect, useState } from 'react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { classroom } from '@/Types'
import { useNavigate } from 'react-router-dom'

export default function Classroom() {
  const navigate = useNavigate()
  const { classrooms, hasClassroomUpdate, throwClassroomHasAlreadyUpdated } =
    useContext(ClassroomContext)
  const [classroom, setClassroom] = useState<classroom>({} as classroom)
  const [classroomId, setClassroomId] = useState<string>('')
  const { logout, user, isCheckingLocalStorage } = useAuth()

  useEffect(() => {
    if (!user && !isCheckingLocalStorage) {
      navigate('/login')
    }
  }, [user, isCheckingLocalStorage, navigate])

  if (user && !classroomId) {
    const { classroomId } = user

    if (classroomId) {
      setClassroomId(classroomId!)
    }
  }

  useEffect(() => {
    async function getClassroom() {
      if (classroomId) {
        const classroom = await ClassroomRepository.getClassroom(classroomId)
        if (classroom) {
          setClassroom(classroom)
        }
      }
    }
    getClassroom().finally(throwClassroomHasAlreadyUpdated)
  }, [
    classrooms,
    user,
    hasClassroomUpdate,
    throwClassroomHasAlreadyUpdated,
    classroomId,
  ])

  if (!classroomId) {
    return (
      <div className="flex min-h-screen flex-col bg-bunker-950">
        <header className="flex h-20 items-center justify-between bg-bunker-900 p-4 duration-300">
          <img className="w-14" src={catequeseLogo} alt="" />
          <Avatar
            classNames={{ base: 'bg-bunker-300 mr-4', icon: 'text-bunker-800' }}
            onClick={() => logout()}
          />
        </header>
        <main className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
          <p className="text-2xl">Turma não encontrada!</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bunker-950">
      <header className="flex h-20 items-center justify-between bg-bunker-900 p-4 duration-300">
        <img className="w-14" src={catequeseLogo} alt="" />
        <Avatar
          classNames={{ base: 'bg-bunker-300 mr-4', icon: 'text-bunker-800' }}
          onClick={() => logout()}
        />
      </header>
      <main className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
        {classroom.id && classrooms[0] && (
          <CatechizingsTable
            catechizings={classroom.catechizings!}
            hasPageClassroomInfo={true}
          />
        )}
      </main>
    </div>
  )
}
