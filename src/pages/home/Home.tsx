import { PageHeader } from '@/components/PageHeader'
import { surfaceClassName } from '@/components/tableStyles'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { useAuth } from '@/hooks/useAuth'
import { calculateAge } from '@/utils/date'
import {
  Archive,
  CalendarCheck,
  CheckSquare,
  Cake,
  ChalkboardTeacher,
  Chalkboard,
  HandCoins,
  Student,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react'
import { ReactNode, useContext } from 'react'
import { Link } from 'react-router-dom'

interface shortcut {
  link: string
  title: string
  description: string
  icon: ReactNode
}

const coordinatorShortcuts: shortcut[] = [
  {
    link: '/classrooms',
    title: 'Turmas',
    description: 'Catequizandos, chamada, PDF e convites',
    icon: <Chalkboard size={24} />,
  },
  {
    link: '/meetings',
    title: 'Chamadas',
    description: 'Encontros, temas e faltas de todas as turmas',
    icon: <CheckSquare size={24} />,
  },
  {
    link: '/catechizing',
    title: 'Catequizandos',
    description: 'Todos os catequizandos e cadastro',
    icon: <Student size={24} />,
  },
  {
    link: '/catechist',
    title: 'Catequistas',
    description: 'Equipe, turmas e senhas',
    icon: <ChalkboardTeacher size={24} />,
  },
  {
    link: '/formations',
    title: 'Formações',
    description: 'Encontros e chamada dos catequistas',
    icon: <CalendarCheck size={24} />,
  },
  {
    link: '/finances',
    title: 'Finanças',
    description: 'Caixa, entradas, saídas e carnê',
    icon: <HandCoins size={24} />,
  },
  {
    link: '/archive',
    title: 'Arquivo',
    description: 'Turmas e pessoas arquivadas',
    icon: <Archive size={24} />,
  },
  {
    link: '/profile',
    title: 'Meu perfil',
    description: 'Seus dados e troca de senha',
    icon: <UserCircle size={24} />,
  },
]

const memberShortcuts: shortcut[] = [
  {
    link: '/classroom',
    title: 'Minhas turmas',
    description: 'Catequizandos, chamada, PDF e convites',
    icon: <Chalkboard size={24} />,
  },
  {
    link: '/meetings',
    title: 'Chamadas',
    description: 'Chamada dos encontros e faltas',
    icon: <CheckSquare size={24} />,
  },
  {
    link: '/finances',
    title: 'Carnê',
    description: 'Registrar e consultar pagamentos do carnê',
    icon: <HandCoins size={24} />,
  },
  {
    link: '/catechizing',
    title: 'Catequizandos',
    description: 'Pesquisar catequizandos',
    icon: <Student size={24} />,
  },
  {
    link: '/profile',
    title: 'Meu perfil',
    description: 'Seus dados e troca de senha',
    icon: <UserCircle size={24} />,
  },
]

interface birthday {
  key: string
  name: string
  detail: string
  day: number
  age?: number
}

function birthdayDay(date?: string) {
  if (!date) {
    return undefined
  }
  const [, month, day] = date.slice(0, 10).split('-').map(Number)
  return { month, day }
}

// Página inicial: resumo, atalhos e aniversariantes do mês
export function Home() {
  const { user } = useAuth()
  const { classrooms, catechizings, catechists } = useContext(ClassroomContext)
  const isCoordinator = user?.role === 'COORDINATOR'

  // O catequista vê só as turmas dele
  const visibleClassrooms = isCoordinator
    ? classrooms
    : classrooms.filter((classroom) =>
        user?.classroomIds.includes(classroom.id!),
      )
  const visibleCatechizings = isCoordinator
    ? catechizings
    : catechizings.filter((catechizing) =>
        visibleClassrooms.some(
          (classroom) => classroom.id === catechizing.classroomId,
        ),
      )

  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const monthName = today.toLocaleDateString('pt-BR', { month: 'long' })

  const birthdays: birthday[] = [
    ...visibleCatechizings.map((catechizing) => ({
      key: `catechizing:${catechizing.id}`,
      name: catechizing.name,
      detail:
        visibleClassrooms.find(
          (classroom) => classroom.id === catechizing.classroomId,
        )?.location ?? 'Catequizando',
      date: catechizing.birthday,
    })),
    ...(isCoordinator
      ? catechists.map((catechist) => ({
          key: `catechist:${catechist.id}`,
          name: catechist.name,
          detail: 'Catequista',
          date: catechist.birthday,
        }))
      : []),
  ]
    .map((person) => ({ ...person, birthday: birthdayDay(person.date) }))
    .filter((person) => person.birthday?.month === currentMonth)
    .map((person) => ({
      key: person.key,
      name: person.name,
      detail: person.detail,
      day: person.birthday!.day,
      // Idade que vai fazer neste aniversário
      age:
        (calculateAge(person.date) ?? 0) +
        (person.birthday!.day > today.getDate() ? 1 : 0),
    }))
    .sort((a, b) => a.day - b.day)

  const stats = [
    { label: 'Catequizandos', value: visibleCatechizings.length },
    {
      label: isCoordinator ? 'Turmas' : 'Minhas turmas',
      value: visibleClassrooms.length,
    },
    ...(isCoordinator
      ? [{ label: 'Catequistas', value: catechists.length }]
      : []),
    { label: `Aniversariantes de ${monthName}`, value: birthdays.length },
  ]

  const shortcuts = isCoordinator ? coordinatorShortcuts : memberShortcuts
  const firstName = user?.nickname || user?.name.split(' ')[0]

  return (
    <div className="flex flex-grow flex-col gap-6">
      <PageHeader
        title={`Olá, ${firstName}!`}
        description={today.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      />

      <div
        className={`grid grid-cols-2 gap-3 ${stats.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}
      >
        {stats.map((stat) => (
          <div key={stat.label} className={`${surfaceClassName} px-5 py-4`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
              {stat.label}
            </p>
            <p className="text-3xl font-semibold tabular-nums text-bunker-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bunker-500">
          Atalhos
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.link}
              to={shortcut.link}
              className={`${surfaceClassName} flex items-center gap-4 px-5 py-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-bunker-300 hover:shadow-md`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bunker-100 text-bunker-700">
                {shortcut.icon}
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-bunker-900">
                  {shortcut.title}
                </span>
                <span className="text-sm text-bunker-500">
                  {shortcut.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${surfaceClassName} flex flex-col gap-3 p-5`}>
        <h2 className="flex items-center gap-2 font-semibold text-bunker-900">
          <Cake size={20} className="text-bunker-600" />
          Aniversariantes de {monthName}
        </h2>
        {birthdays.length ? (
          <ul className="flex flex-col divide-y divide-bunker-100">
            {birthdays.map((person) => (
              <li
                key={person.key}
                className={`flex items-center gap-3 py-2 ${person.day === today.getDate() ? 'font-semibold' : ''}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bunker-50 text-sm font-semibold tabular-nums text-bunker-700">
                  {String(person.day).padStart(2, '0')}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-bunker-900">
                    {person.name}
                    {person.day === today.getDate() && ' 🎉'}
                  </span>
                  <span className="text-xs font-normal text-bunker-500">
                    {person.detail} · faz {person.age} anos
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-bunker-500">
            <UsersThree size={18} />
            Ninguém faz aniversário este mês.
          </p>
        )}
      </section>
    </div>
  )
}
