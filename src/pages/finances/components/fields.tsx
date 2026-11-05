import { paymentMethodLabels, paymentMethods, paymentMethod } from '@/Types'
import { maskMoneyInput } from '@/utils/currency'
import { fromCalendarDate, toCalendarDate } from '@/utils/date'
import { DatePicker, Input, Select, SelectItem } from '@nextui-org/react'
import { I18nProvider } from '@react-aria/i18n'

interface FieldProps<T> {
  value: T
  onChange: (value: T) => void
  error?: string
}

// Valor em reais ('350,00'); o formulário converte para centavos
export function MoneyInput({ value, onChange, error }: FieldProps<string>) {
  return (
    <Input
      label="Valor"
      inputMode="decimal"
      placeholder="0,00"
      startContent={<span className="text-sm text-bunker-500">R$</span>}
      value={value}
      onValueChange={(text) => onChange(maskMoneyInput(text))}
      isInvalid={Boolean(error)}
      errorMessage={error}
    />
  )
}

export function PaymentMethodSelect({
  value,
  onChange,
  error,
}: FieldProps<paymentMethod | ''>) {
  return (
    <Select
      label="Forma de pagamento"
      disallowEmptySelection
      selectedKeys={value ? [value] : []}
      onChange={(event) => onChange(event.target.value as paymentMethod)}
      isInvalid={Boolean(error)}
      errorMessage={error}
      classNames={{
        listbox: 'text-bunker-800',
        selectorIcon: 'text-bunker-500',
      }}
    >
      {paymentMethods.map((method) => (
        <SelectItem key={method}>{paymentMethodLabels[method]}</SelectItem>
      ))}
    </Select>
  )
}

export function DateInput({ value, onChange, error }: FieldProps<string>) {
  return (
    <I18nProvider locale="pt-BR">
      <DatePicker
        label="Data"
        value={toCalendarDate(value)}
        onChange={(date) => onChange(fromCalendarDate(date) ?? '')}
        isInvalid={Boolean(error)}
        errorMessage={error}
        showMonthAndYearPickers
      />
    </I18nProvider>
  )
}
