import { DEFAULT_AREA_CODE, maskPhone } from '@/utils/phone'
import { Input, InputProps } from '@nextui-org/react'
import { forwardRef } from 'react'

interface PhoneInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
}

// Ao focar o campo vazio já preenche o DDD 61; o resto é formatado ao digitar
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onChange, ...props }, ref) {
    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        placeholder={`(${DEFAULT_AREA_CODE}) 99999-9999`}
        {...props}
        value={maskPhone(value)}
        onFocus={() => {
          if (!value) {
            onChange(`(${DEFAULT_AREA_CODE}) `)
          }
        }}
        onBlur={() => {
          if (value.replace(/\D/g, '') === DEFAULT_AREA_CODE) {
            onChange('')
          }
        }}
        onChange={(e) => onChange(maskPhone(e.target.value))}
      />
    )
  },
)
