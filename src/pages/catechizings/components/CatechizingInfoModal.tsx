import {
  Checkbox,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react'

import { catechizing } from '@/Types'
import { parseAbsoluteToLocal } from '@internationalized/date'

interface CatechizingInfoProps {
  data: catechizing
  isOpen: boolean
  onClose: () => void
}

export function CatechizingInfoModal({
  data,
  isOpen,
  onClose,
}: CatechizingInfoProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      placement="center"
      className="flex w-9/12 flex-col rounded-xl bg-bunker-900 py-4 md:w-5/12 lg:w-3/12 2xl:w-3/12"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center text-xl">
          Catequizando
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input isReadOnly label="Nome" value={data.name} />

            <DatePicker
              label="Data"
              isReadOnly
              value={parseAbsoluteToLocal(data.birthday!)}
              dateInputClassNames={{
                inputWrapper: 'border hover:border-2 focus:border-2',
              }}
              classNames={{ input: '!text-brown-500' }}
              showMonthAndYearPickers
              granularity="day"
            />

            <Input readOnly label="Endereço" value={data.address} />
            <Checkbox
              readOnly
              value="Batismo"
              isSelected={data.hasReceivedBaptism}
              classNames={{ label: 'text-white' }}
            >
              Batismo
            </Checkbox>
            <Checkbox
              value="1° Eucaristia"
              isSelected={data.hasReceivedEucharist}
              classNames={{ label: 'text-white' }}
              readOnly
            >
              1° Eucaristia
            </Checkbox>
            <Checkbox
              value="Sacramento do Matrimônio"
              isSelected={data.hasReceivedMarriage}
              classNames={{ label: 'text-white' }}
              readOnly
            >
              Sacramento do Matrimônio
            </Checkbox>
            <Checkbox
              value="Pessoa com necessidade especial"
              isSelected={data.personWithSpecialNeeds}
              classNames={{ label: 'text-white' }}
              readOnly
            >
              Pessoa com Necessidade Especial
            </Checkbox>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
