import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
} from '@nextui-org/react'
import catequeseLogo from '../assets/catequese-logo.svg'
import { useState } from 'react'
import { List } from '@phosphor-icons/react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useParish } from '@/hooks/useParish'
import { APP_NAME } from '@/lib/config'
import User from './User'

const menuItems = [
  { permission: 'ALL', name: 'Início', link: '/inicio' },
  { permission: 'MEMBER', name: 'Minhas turmas', link: '/classroom' },
  { permission: 'COORDINATOR', name: 'Turmas', link: '/classrooms' },
  { permission: 'COORDINATOR', name: 'Finanças', link: '/finances' },
  { permission: 'ALL', name: 'Chamadas', link: '/meetings' },
  { permission: 'ALL', name: 'Catequizandos', link: '/catechizing' },
  { permission: 'COORDINATOR', name: 'Inscrições', link: '/inscricoes' },
  { permission: 'COORDINATOR', name: 'Catequistas', link: '/catechist' },
  { permission: 'COORDINATOR', name: 'Formações', link: '/formations' },
  // Catequista só tem o carnê dentro das finanças
  { permission: 'MEMBER', name: 'Carnê', link: '/finances' },
  { permission: 'ALL', name: 'Ritos', link: '/rites' },
  { permission: 'COORDINATOR', name: 'Arquivo', link: '/archive' },
]

const mobileNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex w-full items-center rounded-xl px-4 py-3 text-xl font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-white/15 text-white'
      : 'text-bunker-300 hover:bg-white/5 hover:text-white'
  }`

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-white/15 text-white'
      : 'text-bunker-300 hover:bg-white/5 hover:text-white'
  }`

export function Header() {
  const { user } = useAuth()
  const { parish } = useParish()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!user) {
    return <></>
  }

  const visibleItems = menuItems.filter(
    (item) => item.permission === user.role || item.permission === 'ALL',
  )

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      height="4.5rem"
      className="border-b border-white/5 bg-bunker-950"
      classNames={{ wrapper: 'max-w-screen-2xl px-4 sm:px-8' }}
    >
      <NavbarContent>
        <NavbarBrand className="gap-4">
          <button
            className="rounded-full p-2 duration-300 hover:bg-white/10 sm:hidden"
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <List color="#d1dae6" size={28} />
          </button>
          {/* O símbolo leva para a página inicial */}
          <Link
            to="/inicio"
            aria-label="Ir para a página inicial"
            className="flex items-center gap-3 rounded-lg duration-150 hover:opacity-80"
          >
            <img className="w-11" src={catequeseLogo} alt="" />
            <span
              title={parish?.name ?? APP_NAME}
              className="hidden max-w-44 whitespace-normal text-sm font-semibold leading-tight tracking-wide text-white 2xl:block"
            >
              {parish?.name ?? APP_NAME}
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-1 sm:flex" justify="center">
        {visibleItems.map((item) => (
          <NavbarItem key={item.link}>
            <NavLink className={navLinkClassName} to={item.link}>
              {item.name}
            </NavLink>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <User />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu className="gap-1 bg-bunker-950/95 pt-4">
        {visibleItems.map((item) => (
          <NavbarMenuItem key={item.link}>
            <NavLink
              className={mobileNavLinkClassName}
              to={item.link}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </NavLink>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  )
}
