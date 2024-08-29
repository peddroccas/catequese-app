import Select from '@/components/Select'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { ToolBar } from '@/pages/classrooms/components/ToolBar'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react'
import { useContext, useState } from 'react'

export function Classrooms() {
  const { classroomNames } = useContext(ClassroomContext)
  const [selectedClass, setSelectedClass] = useState<string>('')
  return (
    <div className="mx-10 mt-4 flex flex-grow flex-col gap-8 pb-8 pt-4">
      <nav className="flex justify-between">
        <Select
          label="Turmas"
          options={classroomNames}
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        />
        <ToolBar />
      </nav>
      <Table
        aria-label="Catequizandos da turma selecionada"
        classNames={{
          wrapper: 'bg-bunker-900',
          th: 'bg-bunker-300 text-bunker-950',
        }}
      >
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>Tony Reichert</TableCell>
            <TableCell>CEO</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow key="2">
            <TableCell>Zoey Lang</TableCell>
            <TableCell>Technical Lead</TableCell>
            <TableCell>Paused</TableCell>
          </TableRow>
          <TableRow key="3">
            <TableCell>Jane Fisher</TableCell>
            <TableCell>Senior Developer</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow key="4">
            <TableCell>William Howard</TableCell>
            <TableCell>Community Manager</TableCell>
            <TableCell>Vacation</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
