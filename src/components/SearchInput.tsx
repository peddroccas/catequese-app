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
      variant="bordered"
      className="sm:max-w-sm"
      classNames={{
        inputWrapper:
          'border-1 border-bunker-200 bg-white shadow-sm data-[hover=true]:border-bunker-300',
      }}
      startContent={<MagnifyingGlass className="text-bunker-400" size={18} />}
    />
  )
}
