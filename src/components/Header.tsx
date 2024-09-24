import {
  Avatar,
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
import { NavLink } from 'react-router-dom'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { name: 'Turmas', link: '/classrooms' },
    { name: 'Carnês', link: '/payment' },
    { name: 'Catequizandos', link: '/catechizing' },
    { name: 'Catequistas', link: '/catechist' },
    { name: 'Ritos', link: '/rites' },
  ]
  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      onBlur={() => setIsMenuOpen(false)}
      height="5rem"
      className="bg-bunker-900 duration-300"
      classNames={{ wrapper: 'p-4' }}
    >
      <NavbarContent>
        <NavbarBrand className="gap-4">
          <button
            className="rounded-full p-2 duration-300 hover:bg-slate-800 sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <List color="#d1dae6" size={28} />
          </button>
          <img className="w-14" src={catequeseLogo} alt="" />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-8 sm:flex" justify="center">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <NavLink
              className={({ isActive }) =>
                `flex transform items-center gap-2 p-2 transition-all duration-150 ${
                  isActive
                    ? 'scale-105 border-b-2 border-bunker-300 font-bold text-bunker-300'
                    : 'text-bunker-100 hover:scale-105 hover:border-b-1 hover:border-bunker-300 hover:text-bunker-300'
                }`
              }
              to={item.link}
            >
              {item.name}
            </NavLink>
          </NavbarMenuItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Avatar
            classNames={{ base: 'bg-bunker-300', icon: 'text-bunker-800' }}
          />
        </NavbarItem>
        <NavbarItem></NavbarItem>
      </NavbarContent>
      <NavbarMenu className="w-fit bg-bunker-950 opacity-95">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 transition-colors duration-300 ${
                  isActive
                    ? 'border-b-1 font-bold text-bunker-300'
                    : 'text-bunker-300'
                }`
              }
              to={item.link}
            >
              {item.name}
            </NavLink>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  )
}
