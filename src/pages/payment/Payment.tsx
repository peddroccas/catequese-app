import { Autocomplete, AutocompleteItem } from '@nextui-org/react'
import { useContext, useEffect, useState } from 'react'
import Select from '../../components/Select'
import { PeopleContext } from '../../context/PeopleContext'
import { segments } from '../../Types'

export function Payment() {
  const { classroomList, catechistList } = useContext(PeopleContext)
  const [segment, setSegment] = useState<string>()
  const [classroom, setClassroom] = useState<string>('')
  const [catechizing, setCatechizing] = useState<string>('')
  const [filteredClassroom, setFilteredClassroom] = useState<string[]>([])

  useEffect(() => {
    function filteredOptions() {
      if (segment) {
        const filteredClassroomList: string[] = []

        classroomList.forEach((classroom) => {
          if (classroom.segment === segments[Number(segment)]) {
            filteredClassroomList.push(
              `Turma ${String(classroom.classNumber)} - ${classroom.catechist.map((catechist) => catechistList[catechist].name.split(' ')[0]).join(' e ')}`,
            )
          }
        })
        console.log(filteredClassroomList)
        setFilteredClassroom(filteredClassroomList)
      }
    }
    filteredOptions()
  }, [catechistList, classroomList, segment])

  return (
    classroomList &&
    catechistList && (
      <div className="mt-8 flex w-full flex-col items-center justify-center">
        <h1 className="text-2xl">Pagamento do carnê</h1>
        <form className="mt-8 flex flex-col gap-4 rounded-xl bg-blue-950 p-4">
          <Select
            label="Segmento"
            value={String(segment)}
            options={[
              'eucaristia',
              'crisma',
              'catequeseadultos',
              'sementinha',
              'preeucaristia',
            ]}
            onChange={(e) => setSegment(e.target.value)}
          />
          <Select
            label="Turma"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            options={filteredClassroom}
          />
          <Autocomplete
            label="Catequizando"
            value={catechizing}
            onChange={(e) => setCatechizing(e.target.value)}
          >
            {['1', '2', '3'].map((item) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          <p className="text-lg font-bold text-white">Parcelas</p>
        </form>
      </div>
    )
  )
}
