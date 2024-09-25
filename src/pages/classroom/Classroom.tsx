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
    if (!user || !isCheckingLocalStorage) {
      navigate('/login')
    }
  }, [user, isCheckingLocalStorage, navigate])

  if (user) {
    const { classroomId } = user
    setClassroomId(classroomId!)
  }

  useEffect(() => {
    async function getClassroom() {
      const classroom = await ClassroomRepository.getClassroom(classroomId!)
      if (classroom) {
        setClassroom(classroom)
      }
    }
    getClassroom().finally(throwClassroomHasAlreadyUpdated)
  }, [
    classrooms,
    hasClassroomUpdate,
    throwClassroomHasAlreadyUpdated,
    classroomId,
  ])

  return (
    <div className="flex min-h-screen flex-col bg-bunker-950">
      <header className="flex h-20 items-center justify-between bg-bunker-900 p-4 duration-300">
        <img className="w-14" src={catequeseLogo} alt="" />
        <Avatar
          classNames={{ base: 'bg-bunker-300 mr-4', icon: 'text-bunker-800' }}
          onClick={() => logout()}
        />
      </header>
      <main>
        {classroom.id && (
          <CatechizingsTable
            catechizings={classroom.catechizings!}
            hasPageClassroomInfo={true}
          />
        )}
      </main>
    </div>
  )
}
