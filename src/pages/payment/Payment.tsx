import { Autocomplete, AutocompleteItem, Input } from '@nextui-org/react'
import { useState } from 'react'
import Select from '../../components/Select'

export function Payment() {
  const [segment, setSegment] = useState<string>('')
  const [catechizing, setCatechizing] = useState<string>('')

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center">
      <h1 className="text-2xl">Pagamento do carnê</h1>
      <form className="mt-8 flex flex-col gap-4 rounded-xl bg-blue-950 p-4">
        <Select
          label="Segmento"
          value={segment}
          options={['1° Eucaristia', 'Crisma', 'Catequese de Adultos']}
          onChange={(e) => setSegment(e.target.value)}
        />

        <Autocomplete
          label="Catequizando"
          value={catechizing}
          onChange={(e) => setCatechizing(e.target.value)}
        >
          {['1', '2', '3'].map((item) => (
            <AutocompleteItem key={item} value={item}>
              {item}
            </AutocompleteItem>
          ))}
        </Autocomplete>

        <Input />
        <Input />
        <Input />
      </form>
    </div>
  )
}
