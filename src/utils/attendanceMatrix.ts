import { classroom, meeting } from '@/Types'

export interface matrixRow {
  id: string
  name: string
  isInClassroom: boolean
  // Um valor por encontro (mesma ordem das colunas): true presente,
  // false falta, undefined sem registro
  cells: (boolean | undefined)[]
  present: number
  absent: number
}

export interface attendanceMatrix {
  // Do primeiro ao último encontro
  columns: meeting[]
  rows: matrixRow[]
}

// Mapa de frequência da turma: catequizandos x encontros
export function buildAttendanceMatrix(
  classroom: classroom,
  meetings: meeting[],
): attendanceMatrix {
  const columns = [...meetings].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || (a.id ?? '').localeCompare(b.id ?? ''),
  )

  // Quem está na turma e quem já saiu mas tem presença registrada
  const people = new Map<string, { name: string; isInClassroom: boolean }>()
  for (const catechizing of classroom.catechizings ?? []) {
    people.set(catechizing.id!, {
      name: catechizing.name,
      isInClassroom: true,
    })
  }
  for (const meeting of columns) {
    for (const attendance of meeting.attendances) {
      if (!people.has(attendance.catechizingId)) {
        people.set(attendance.catechizingId, {
          name: attendance.catechizingName ?? 'Catequizando removido',
          isInClassroom: false,
        })
      }
    }
  }

  const attendances = columns.map(
    (meeting) =>
      new Map(
        meeting.attendances.map((attendance) => [
          attendance.catechizingId,
          attendance.isPresent,
        ]),
      ),
  )

  const rows = [...people.entries()]
    .map(([id, person]) => {
      const cells = attendances.map((byPerson) => byPerson.get(id))
      return {
        id,
        ...person,
        cells,
        present: cells.filter((cell) => cell === true).length,
        absent: cells.filter((cell) => cell === false).length,
      }
    })
    .sort(
      (a, b) =>
        Number(b.isInClassroom) - Number(a.isInClassroom) ||
        a.name.localeCompare(b.name),
    )

  return { columns, rows }
}

export function attendanceRate(row: matrixRow) {
  const total = row.present + row.absent
  return total ? Math.round((row.present / total) * 100) : undefined
}
