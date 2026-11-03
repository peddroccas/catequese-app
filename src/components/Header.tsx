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
  { permission: 'COORDINATOR', name: 'Ritos e eventos', link: '/rites' },
]

const memberPaths = ['/classroom', '/catechizing', '/profile']

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex transform items-center gap-2 p-2 transition-all duration-150 ${
    isActive
      ? 'scale-105 border-b-2 border-bunker-300 font-bold text-bunker-300'
      : 'text-bunker-100 hover:scale-105 hover:border-b-1 hover:border-bunker-300 hover:text-bunker-300'
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
      height="5rem"
      className="bg-bunker-900 duration-300"
      classNames={{ wrapper: 'p-4' }}
    >
      <NavbarContent>
        <NavbarBrand className="gap-4">
          <button
            className="rounded-full p-2 duration-300 hover:bg-slate-800 sm:hidden"
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <List color="#d1dae6" size={28} />
          </button>
          <img className="w-14" src={catequeseLogo} alt="" />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-8 sm:flex" justify="center">
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
      <NavbarMenu className="w-fit bg-bunker-950 opacity-95">
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
