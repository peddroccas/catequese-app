import { forwardRef, ChangeEvent, useContext } from 'react'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { Select, SelectItem, SelectProps } from '@nextui-org/react'
import { classroom } from '@/Types'

interface ClassroomSelectProps {
  value: classroom

  size?: 'lg'
  props?: SelectProps
  disabledOptions?: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

export const ClassroomSelect = forwardRef<
  HTMLSelectElement,
  ClassroomSelectProps
>(({ onChange, props, value, size, disabledOptions }, ref) => {
  const { classrooms } = useContext(ClassroomContext)

  return (
    value && (
      <Select
        disallowEmptySelection
        ref={ref}
        {...props}
        label={'Turma'}
        onChange={onChange}
        disabledKeys={disabledOptions}
        size={size}
        className="max-w-prose"
        value={value.id}
        classNames={{
          listbox: '!text-bunker-950',
          selectorIcon: 'text-bunker-950',
        }}
        selectedKeys={[value.id!]}
      >
        {classrooms.map((classroom) => (
          <SelectItem key={classroom.id!} value={classroom.name}>
            {classroom.name}
          </SelectItem>
        ))}
      </Select>
    )
  )
})

ClassroomSelect.displayName = 'ClassroomSelect'
