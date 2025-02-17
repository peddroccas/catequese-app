import { Select, SelectItem } from '@heroui/react'
import { ChangeEvent } from 'react'

interface SelectProps {
  value: string
  label: string
  size?: 'lg'
  options: string[]
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

export default function BasicSelect({
  options,
  onChange,
  value,
  size,
  label,
}: SelectProps) {
  return (
    <Select
      label={label}
      onChange={onChange}
      size={size}
      className="max-w-prose"
      value={value}
      classNames={{
        listbox: '!text-bunker-950',
        selectorIcon: 'text-bunker-950',
      }}
      selectedKeys={[value]}
    >
      {options.map(option => (
        <SelectItem key={option} value={option}>
          {option}
        </SelectItem>
      ))}
    </Select>
  )
}
