import Select from '@/components/Select'
import { useContext, useEffect, useState } from 'react'
import { payment } from '@/Types'
import { CatechizingRepository } from '@/services/repositories/catechizingRepository'
import { InstallmentContext } from '@/contexts/InstallmentContext'
import { ClassroomRepository } from '@/services/repositories/classroomRepository'
import { Autocomplete, AutocompleteItem, Button } from '@heroui/react'
import { Plus } from '@phosphor-icons/react'
import { Installment } from './Installment'
import NewInstallmentModal from './modals/NewInstallmentModal'

export function NewInstallmentForm() {
  const { throwInstallmentHasAlreadyUpdated, hasInstallmentUpdate } =
    useContext(InstallmentContext)

  const [segment, setSegment] = useState<string>('')
  const [classroom, setClassroom] = useState<string>('')
  const [catechizing, setCatechizing] = useState<string>('')
  const [classroomsBySegment, setClassroomsBySegment] = useState<
    { id: string; classroomName: string }[]
  >([])
  const [catechizingsByClassroom, setCatechizingsByClassroom] = useState<
    {
      id: string
      name: string
    }[]
  >([])
  const [payment, setPayment] = useState<payment | null>(null)
  const [isUserAddingNewInstallment, setIsUserAddingNewInstallment] =
    useState<boolean>(false)

  // Consulta nome das turmas
  useEffect(() => {
    async function getClassroomNames() {
      if (segment) {
        const classroomNamesResponse =
          await ClassroomRepository.getClassroomNamesBySegment(segment)
        setClassroomsBySegment(classroomNamesResponse)
      }
    }
    getClassroomNames()
  }, [segment])

  // Consulta nome dos catequizandos por turma
  useEffect(() => {
    async function getCatechizingByClassroom() {
      if (classroom) {
        const classroomId = classroomsBySegment.map(classroomObj => {
          if (classroomObj.classroomName === classroom) {
            return classroomObj.id
          }
          return ''
        })[0]
        const catechizings =
          await ClassroomRepository.getCatechizingByClassroom(classroomId)
        setCatechizingsByClassroom(catechizings)
      }
    }
    getCatechizingByClassroom()
  }, [classroom, classroomsBySegment, segment])

  // Consulta carnê do catequizando
  useEffect(() => {
    async function getPaymentsByCatechizing() {
      if (catechizing || hasInstallmentUpdate) {
        const payment =
          await CatechizingRepository.getPaymentsByCatechizing(catechizing)

        setPayment(payment)
        throwInstallmentHasAlreadyUpdated()
      }
    }
    getPaymentsByCatechizing()
  }, [catechizing, hasInstallmentUpdate, throwInstallmentHasAlreadyUpdated])

  function handleAddNewInstallment() {
    setIsUserAddingNewInstallment(true)
  }

  function handleOnCloseNewInstallmentModal() {
    setIsUserAddingNewInstallment(false)
  }
  return (
    <>
      <h1 className="text-2xl">Pagamento do Carnê</h1>
      <form className="flex w-11/12 flex-col gap-4 rounded-xl bg-bunker-900 p-4 text-bunker-950 md:w-6/12 lg:w-5/12 2xl:w-3/12">
        <Select
          label="Segmento"
          value={segment}
          options={[
            '1° Eucaristia',
            'Crisma',
            'Catequizandos Adultos',
            'Catecúmenos Adultos',
            'Sementinha',
            'Pré-Eucaristia',
          ]}
          onChange={e => {
            setSegment(e.target.value)
            setClassroomsBySegment([])
            setClassroom('')
            setCatechizing('')
            setPayment(null)
            setCatechizingsByClassroom([])
          }}
        />
        <Select
          label="Turma"
          value={classroom}
          onChange={e => {
            setClassroom(e.target.value)
            setCatechizingsByClassroom([])
            setCatechizing('')
            setPayment(null)
          }}
          options={classroomsBySegment.map(
            classroom => classroom.classroomName
          )}
        />
        <Autocomplete
          label="Catequizando"
          selectedKey={catechizing}
          defaultSelectedKey={''}
          className="!text-bunker-950"
          classNames={{ listboxWrapper: '!text-bunker-950' }}
          isClearable={false}
          onSelectionChange={selected => setCatechizing(String(selected))}
        >
          {catechizingsByClassroom.map(catechizing => (
            <AutocompleteItem key={catechizing.id} value={catechizing.name}>
              {catechizing.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>

        {payment && (
          <div className="rounded-xl">
            <header className="flex flex-row items-center justify-between gap-2 pb-2 text-white">
              <div className="flex flex-row gap-2">
                <p className="text-2xl font-bold">Parcelas</p>
                <Button
                  isIconOnly
                  isDisabled={payment.toBePaid === 0}
                  onClick={handleAddNewInstallment}
                  radius="full"
                  size="sm"
                >
                  <Plus size={22} />
                </Button>
                <NewInstallmentModal
                  catechizing={catechizing}
                  onClose={handleOnCloseNewInstallmentModal}
                  open={isUserAddingNewInstallment}
                />
              </div>

              <p
                className={`${payment.toBePaid === 0 ? 'text-green-600' : 'text-red-600'} rounded-xl bg-white p-1 text-lg font-semibold`}
              >
                {payment.toBePaid === 0
                  ? 'Pago'
                  : payment.toBePaid.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
              </p>
            </header>
            <div>
              <Installment paymentData={payment} />
            </div>
          </div>
        )}
      </form>
    </>
  )
}
