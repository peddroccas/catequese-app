import { ClassroomContext } from '@/contexts/ClassroomContext'
import { Select, SelectItem, SelectProps } from '@nextui-org/react'
import { ChangeEvent, useContext } from 'react'

interface ClassroomSelectProps {
  value: {
    id: string
    classroomName: string
  }
  size?: 'lg'
  props: SelectProps
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

export function ClassroomSelect({
  onChange,
  props,
  value,
  size,
}: ClassroomSelectProps) {
  const { classrooms } = useContext(ClassroomContext)

  return (
    value && (
      <Select
        {...props}
        label={'Turma'}
        onChange={onChange}
        size={size}
        className="max-w-prose"
        value={value.id}
        classNames={{ listbox: '!text-bunker-950' }}
        selectedKeys={[value.id]}
      >
        {classrooms.map((classroom) => (
          <SelectItem key={classroom.id} value={classroom.classroomName}>
            {classroom.classroomName}
          </SelectItem>
        ))}
      </Select>
    )
  )
}
