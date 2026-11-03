import { Input } from '@nextui-org/react'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Pesquisar catequizando',
}: SearchInputProps) {
  return (
    <Input
      aria-label={placeholder}
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
      isClearable
      onClear={() => onChange('')}
      className="sm:max-w-xs"
      startContent={<MagnifyingGlass className="text-bunker-950" size={20} />}
    />
  )
}
