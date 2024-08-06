import { Select, SelectItem } from '@nextui-org/react'
import { ChangeEvent } from 'react'

interface SelectProps {
  value: string
  label: string
  options: string[]
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

export default function BasicSelect({
  options,
  onChange,
  value,
  label,
}: SelectProps) {
  return (
    <Select label={label} onChange={onChange} value={value}>
      {options.map((option, index) => (
        <SelectItem key={index} value={option}>
          {option}
        </SelectItem>
      ))}
    </Select>
  )
}
