import { surfaceClassName } from '@/components/tableStyles'
import { classroom, meeting } from '@/Types'
import { attendanceRate, buildAttendanceMatrix } from '@/utils/attendanceMatrix'
import { formatDate } from '@/utils/date'
import { downloadAttendanceMatrixExcel } from '@/utils/downloadAttendanceMatrix'
import { downloadAttendanceMatrixPdf } from '@/utils/pdf'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from '@nextui-org/react'
import {
  CaretDown,
  Check,
  DownloadSimple,
  FilePdf,
  MicrosoftExcelLogo,
  X,
} from '@phosphor-icons/react'
import { useMemo } from 'react'

interface AttendanceMatrixProps {
  classroom: classroom
  meetings: meeting[]
}

// Mapa de frequência: catequizandos nas linhas, encontros (por data) nas colunas
export function AttendanceMatrix({
  classroom,
  meetings,
}: AttendanceMatrixProps) {
  const { columns, rows } = useMemo(
    () => buildAttendanceMatrix(classroom, meetings),
    [classroom, meetings],
  )

  if (!columns.length) {
    return (
      <p className="text-bunker-500">
        Registre uma chamada para ver o mapa de frequência.
      </p>
    )
  }

  const headCell =
    'border-b border-bunker-200 bg-bunker-50 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-bunker-500'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-bunker-500">
          <span className="flex items-center gap-1">
            <Check size={14} weight="bold" className="text-emerald-600" />{' '}
            Presente
          </span>
          <span className="flex items-center gap-1">
            <X size={14} weight="bold" className="text-red-500" /> Falta
          </span>
          <span className="flex items-center gap-1">
            <span className="text-bunker-300">–</span> Sem registro
          </span>
          <span>Passe o mouse na data para ver os temas</span>
        </div>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="bordered"
              startContent={<DownloadSimple size={18} />}
              endContent={<CaretDown size={14} />}
              className="h-9 min-w-0 shrink-0 gap-1.5 border-1 border-bunker-200 bg-white px-3 font-medium text-bunker-700 shadow-sm"
            >
              Baixar
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Baixar mapa de frequência"
            classNames={{ base: 'min-w-64' }}
          >
            <DropdownItem
              key="excel"
              description="Planilha com presença e temas"
              startContent={
                <MicrosoftExcelLogo size={22} className="text-emerald-600" />
              }
              onPress={() => downloadAttendanceMatrixExcel(classroom, meetings)}
            >
              Mapa de frequência (Excel)
            </DropdownItem>
            <DropdownItem
              key="pdf"
              description="Para imprimir (paisagem)"
              startContent={<FilePdf size={22} className="text-red-500" />}
              onPress={() => downloadAttendanceMatrixPdf(classroom, meetings)}
            >
              Mapa de frequência (PDF)
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className={`${surfaceClassName} scrollbar-thin overflow-x-auto`}>
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th
                className={`${headCell} sticky left-0 z-10 min-w-48 text-left`}
              >
                Catequizando
              </th>
              {columns.map((meeting) => (
                <th
                  key={meeting.id}
                  className={`${headCell} whitespace-nowrap`}
                >
                  <Tooltip
                    closeDelay={0}
                    content={
                      <ul className="max-w-xs list-disc py-1 pl-4 text-xs normal-case">
                        {meeting.themes.map((theme) => (
                          <li key={theme.id}>{theme.name}</li>
                        ))}
                      </ul>
                    }
                  >
                    <span className="cursor-default">
                      {formatDate(meeting.date).slice(0, 5)}
                    </span>
                  </Tooltip>
                </th>
              ))}
              <th className={headCell}>Faltas</th>
              <th className={headCell}>Freq.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((person) => {
              const rate = attendanceRate(person)
              return (
                <tr key={person.id} className="group">
                  <td className="sticky left-0 z-10 whitespace-nowrap border-b border-bunker-100 bg-white px-3 py-2 font-medium text-bunker-900 group-hover:bg-bunker-50">
                    {person.name}
                    {!person.isInClassroom && (
                      <span className="ml-2 text-xs font-normal text-bunker-400">
                        (saiu da turma)
                      </span>
                    )}
                  </td>
                  {person.cells.map((isPresent, index) => (
                    <td
                      key={columns[index].id}
                      className="border-b border-bunker-100 px-3 py-2 text-center group-hover:bg-bunker-50"
                    >
                      {isPresent === true && (
                        <Check
                          size={16}
                          weight="bold"
                          className="mx-auto text-emerald-600"
                          aria-label="Presente"
                        />
                      )}
                      {isPresent === false && (
                        <X
                          size={16}
                          weight="bold"
                          className="mx-auto text-red-500"
                          aria-label="Falta"
                        />
                      )}
                      {isPresent === undefined && (
                        <span className="text-bunker-300">–</span>
                      )}
                    </td>
                  ))}
                  <td className="border-b border-bunker-100 px-3 py-2 text-center font-medium tabular-nums text-red-500 group-hover:bg-bunker-50">
                    {person.absent}
                  </td>
                  <td className="border-b border-bunker-100 px-3 py-2 text-center tabular-nums group-hover:bg-bunker-50">
                    {rate === undefined ? '–' : `${rate}%`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
