import { Autocomplete, AutocompleteItem, Input } from '@nextui-org/react'

export function Payment() {
  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center">
      <h1 className="text-2xl">Pagamento do carnê</h1>
      <form className="mt-8 flex flex-col gap-4 rounded-xl bg-blue-950 p-4">
        <Autocomplete label="Turma">
          {[1, 2, 3].map((item) => (
            <AutocompleteItem key={item} value={item}>
              {item}
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <Input />
        <Input />
        <Input />
        <Input />
      </form>
    </div>
  )
}
