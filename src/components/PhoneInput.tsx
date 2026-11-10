import { getAreaCode } from '@/utils/parish'
import { maskPhone } from '@/utils/phone'
import { Input, InputProps } from '@nextui-org/react'
import { forwardRef } from 'react'

interface PhoneInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
}

// Ao focar o campo vazio já preenche o DDD da paróquia; o resto é formatado ao digitar
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onChange, ...props }, ref) {
    const areaCode = getAreaCode()

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        placeholder={`(${areaCode}) 99999-9999`}
        {...props}
        value={maskPhone(value)}
        onFocus={() => {
          if (!value) {
            onChange(`(${areaCode}) `)
          }
        }}
        onBlur={() => {
          if (value.replace(/\D/g, '') === areaCode) {
            onChange('')
          }
        }}
        onChange={(e) => onChange(maskPhone(e.target.value))}
      />
    )
  },
)
