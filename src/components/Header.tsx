import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
} from '@nextui-org/react'
import { BrandLogo } from '@/components/BrandLogo'
import { useState } from 'react'
import { List } from '@phosphor-icons/react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useParish } from '@/hooks/useParish'
import { APP_NAME } from '@/lib/config'
import { isPathEnabled } from '@/utils/modules'
import User from './User'

const menuItems = [
  { permission: 'ALL', name: 'Início', link: '/inicio' },
  { permission: 'MEMBER', name: 'Minhas turmas', link: '/classroom' },
  { permission: 'COORDINATOR', name: 'Turmas', link: '/classrooms' },
  { permission: 'COORDINATOR', name: 'Finanças', link: '/finances' },
  { permission: 'ALL', name: 'Chamadas', link: '/meetings' },
  // Catequista vê os catequizandos dele em "Minhas turmas"
  { permission: 'COORDINATOR', name: 'Catequizandos', link: '/catechizing' },
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
      ? 'bg-ouro-100 text-ouro-700'
      : 'text-bunker-500 hover:bg-creme-100 hover:text-bunker-900'
  }`

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-ouro-100 text-ouro-700'
      : 'text-bunker-500 hover:bg-creme-100 hover:text-bunker-900'
  }`

export function Header() {
  const { user } = useAuth()
  const { parish } = useParish()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!user) {
    return <></>
  }

  const visibleItems = menuItems.filter(
    (item) =>
      (item.permission === user.role || item.permission === 'ALL') &&
      isPathEnabled(item.link, parish),
  )

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      // Sem o desfoque: o backdrop-filter prendia o menu do celular à altura
      // da barra e ele não rolava quando passava do fim da tela
      isBlurred={false}
      maxWidth="full"
      height="4.5rem"
      className="border-b border-creme-200 bg-white shadow-sm shadow-bunker-900/5"
      classNames={{ wrapper: 'max-w-screen-2xl px-4 sm:px-8' }}
    >
      <NavbarContent>
        <NavbarBrand className="gap-4">
          <button
            className="rounded-full p-2 duration-300 hover:bg-bunker-100 sm:hidden"
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <List color="#3a4f6a" size={28} />
          </button>
          {/* A logo leva para a página inicial */}
          <Link
            to="/inicio"
            aria-label="Ir para a página inicial"
            className="flex items-center gap-3 rounded-lg duration-150 hover:opacity-80"
          >
            <BrandLogo alt="" title={parish?.name ?? APP_NAME} />
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
      <NavbarMenu className="gap-1 overflow-y-auto overscroll-contain bg-white pb-10 pt-4">
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
