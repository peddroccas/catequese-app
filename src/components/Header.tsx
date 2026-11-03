import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
} from '@nextui-org/react'
import catequeseLogo from '../assets/catequese-logo.svg'
import { useEffect, useState } from 'react'
import { List } from '@phosphor-icons/react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import User from './User'

const menuItems = [
  { permission: 'MEMBER', name: 'Minhas turmas', link: '/classroom' },
  { permission: 'COORDINATOR', name: 'Turmas', link: '/classrooms' },
  { permission: 'ALL', name: 'Catequizandos', link: '/catechizing' },
  { permission: 'COORDINATOR', name: 'Catequistas', link: '/catechist' },
  { permission: 'COORDINATOR', name: 'Formações', link: '/formations' },
  { permission: 'COORDINATOR', name: 'Ritos e eventos', link: '/rites' },
]

const memberPaths = ['/classroom', '/catechizing', '/profile']

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-white/15 text-white'
      : 'text-bunker-300 hover:bg-white/5 hover:text-white'
  }`

export function Header() {
  const { user, isCheckingLocalStorage, mustChangePassword } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!user && !isCheckingLocalStorage) {
      navigate('/login')
      return
    }
    if (!user) {
      return
    }
    // Enquanto usar a senha padrão, só pode ficar no perfil
    if (mustChangePassword && pathname !== '/profile') {
      navigate('/profile')
      return
    }
    if (user.role === 'MEMBER' && !memberPaths.includes(pathname)) {
      navigate('/classroom')
    }
  }, [user, isCheckingLocalStorage, mustChangePassword, pathname, navigate])

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
          <img className="w-11" src={catequeseLogo} alt="" />
          <span className="hidden text-sm font-semibold tracking-wide text-white lg:block">
            Catequese
          </span>
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
              className={navLinkClassName}
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
