import { Autocomplete, AutocompleteItem, Button } from '@nextui-org/react'
import { useContext, useEffect, useState } from 'react'
import Select from '../../components/Select'
import { PeopleContext } from '../../context/PeopleContext'
import { catechizing, classroom } from '../../Types'
import { Installment } from './components/Installment'
import { Plus } from '@phosphor-icons/react'
import NewInstallmentModal from './components/NewInstallmentModal'

export function Payment() {
  const { classroomList, catechistList, catechizingList } =
    useContext(PeopleContext)
  const [segment, setSegment] = useState<string>('')
  const [classroom, setClassroom] = useState<string>('')
  const [catechizing, setCatechizing] = useState<catechizing | undefined>(
    {} as catechizing,
  )
  const [filteredClassroom, setFilteredClassroom] = useState<classroom[]>([])
  const [filteredCatechizing, setFilteredCatechizing] = useState<catechizing[]>(
    [],
  )
  const [isUserAddingNewInstallment, setIsUserAddingNewInstallment] =
    useState<boolean>(false)

  // filtro de turma
  useEffect(() => {
    function filteredClassroom() {
      if (segment) {
        const filteredClassroomList: classroom[] = []
        const segmentKey = (segment: string) => {
          switch (segment) {
            case '1° Eucaristia':
              return 'eucaristia'
            case 'Pré-eucaristia':
              return 'preeucaristia'
            case 'Crisma':
              return 'crisma'
            case 'Catequese de Adultos':
              return 'catequeseadultos'
            case 'Sementinha':
              return 'sementinha'
          }
        }
        classroomList.forEach((classroom) => {
          if (classroom.segment === segmentKey(segment)) {
            filteredClassroomList.push(classroom)
          }
        })
        setFilteredClassroom(filteredClassroomList)
      }
    }
    filteredClassroom()
  }, [catechistList, classroomList, segment, classroom])

  // filtro de catequizando
  useEffect(() => {
    function filteredCatechizing() {
      if (classroom) {
        const filteredCatechizingIDList: string[] = classroomList.filter(
          (room) => classroom.includes(' ' + String(room.classNumber) + ' '),
        )[0].catechizing

        const filteredCatechizingList: catechizing[] =
          filteredCatechizingIDList.map(
            (catechizingID) => catechizingList[Number(catechizingID)],
          )
        setFilteredCatechizing(filteredCatechizingList)
      }
    }

    filteredCatechizing()
  }, [catechistList, catechizingList, classroom, classroomList, segment])

  function handleAddNewInstallment() {
    setIsUserAddingNewInstallment(true)
  }

  function handleOnCloseNewInstallmentModal() {
    setIsUserAddingNewInstallment(false)
  }

  return (
    classroomList &&
    catechistList && (
      <div className="mt-4 flex flex-grow flex-col items-center justify-center pb-8 pt-4">
        <h1 className="text-2xl">Pagamento do carnê</h1>
        <form className="mt-8 flex flex-col gap-4 rounded-xl bg-blue-950 p-4">
          <Select
            label="Segmento"
            value={segment}
            options={[
              '1° Eucaristia',
              'Crisma',
              'Catequese de Adultos',
              'Sementinha',
              'Pré-eucaristia',
            ]}
            onChange={(e) => {
              setSegment(e.target.value)
              setClassroom('')
              setFilteredClassroom([])
              setFilteredCatechizing([])
              setCatechizing({} as catechizing)
            }}
          />
          <Select
            label="Turma"
            value={classroom}
            onChange={(e) => {
              setClassroom(e.target.value)
              setCatechizing({} as catechizing)
              setFilteredCatechizing([])
            }}
            options={filteredClassroom.map((classroom) => {
              return `Turma ${String(classroom.classNumber)} - ${classroom.catechist.map((catechist) => catechistList[catechist].name.split(' ')[0]).join(' e ')}`
            })}
          />
          <Autocomplete
            label="Catequizando"
            selectedKey={catechizing!.name}
            isClearable={false}
            onSelectionChange={(selected) =>
              setCatechizing(
                catechizingList.filter((catechizing) => {
                  if (catechizing.name === selected) {
                    return catechizing
                  }
                  return undefined
                })[0],
              )
            }
          >
            {filteredCatechizing.map((catechizing) => (
              <AutocompleteItem key={catechizing.name} value={catechizing.name}>
                {catechizing.name}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          <div className="rounded-xl">
            <header className="flex flex-row items-center justify-between gap-2 pb-2 text-white">
              <div className="flex flex-row gap-2">
                <p className="text-2xl font-bold">Parcelas</p>
                {catechizing?.name && (
                  <Button
                    isIconOnly
                    onClick={handleAddNewInstallment}
                    radius="full"
                    size="sm"
                  >
                    <Plus size={22} />
                  </Button>
                )}
                <NewInstallmentModal
                  catechizing={catechizing!}
                  onClose={handleOnCloseNewInstallmentModal}
                  open={isUserAddingNewInstallment}
                />
              </div>
              {catechizing?.name && (
                <p
                  className={`${catechizing!.payment.toBePaid === 0 ? 'text-green-600' : 'text-red-600'} rounded-xl bg-white p-1 text-lg font-semibold`}
                >
                  {catechizing!.payment.toBePaid === 0
                    ? 'Pago'
                    : catechizing!.payment.toBePaid.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                </p>
              )}
            </header>
            {catechizing?.name && (
              <div>
                <Installment paymentData={catechizing.payment} />
              </div>
            )}
          </div>
        </form>
      </div>
    )
  )
}
