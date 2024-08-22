import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  DateValue,
} from '@nextui-org/react'
import { I18nProvider } from '@react-aria/i18n'
import { format } from 'date-fns'
import { getLocalTimeZone } from '@internationalized/date'
import { CatechizingRepository } from '../../../services/repositories/catechizingRepository'
import { useContext, useState } from 'react'
import { InstallmentContext } from '../../../contexts/InstallmentContext'

interface NewInstallmentModalProps {
  catechizing: string
  open: boolean
  onClose: () => void
}

export default function NewInstallmentModal({
  open,
  onClose,
  catechizing,
}: NewInstallmentModalProps) {
  const { throwInstallmentUpdate } = useContext(InstallmentContext)
  const { onOpenChange } = useDisclosure()
  const [value, setValue] = useState<string>()
  const [payedAt, setPayedAt] = useState<DateValue>()

  async function handleOnSubmitNewInstallmentModal() {
    const formattedDate = format(
      payedAt!.toDate(getLocalTimeZone()),
      'dd/MM/yyyy',
    )
    await CatechizingRepository.addNewInstallment(catechizing, {
      payedAt: new Date(formattedDate),
      value: Number(value),
    })

    throwInstallmentUpdate()
  }
  return (
    <Modal
      onClose={onClose}
      isOpen={open}
      onOpenChange={onOpenChange}
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Nova parcela
            </ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="Valor"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="number"
                placeholder="Digite o valor"
                variant="bordered"
              />
              <I18nProvider locale="pt-BR">
                <DatePicker
                  label="Data"
                  value={payedAt}
                  dateInputClassNames={{
                    inputWrapper:
                      '!text-brown-300 !bg-transparent border-brown-500 border hover:border-2 focus:border-2',
                    label: '!text-brown-300',
                    innerWrapper: '!text-brown-500',
                    segment: '!text-brown-500',
                  }}
                  classNames={{ input: '!text-brown-500' }}
                  onChange={(newDate) => setPayedAt(newDate)}
                  showMonthAndYearPickers
                  isRequired
                />
              </I18nProvider>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Fechar
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleOnSubmitNewInstallmentModal()
                  setValue('')
                  setPayedAt(undefined)
                  onClose()
                }}
              >
                Adicionar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
