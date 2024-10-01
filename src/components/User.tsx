import { useAuth } from '@/hooks/useAuth'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@nextui-org/react'
import { SignOut, UserCircle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

export default function User() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-end" className="bg-bunker-900">
        <DropdownTrigger>
          <Avatar
            as="button"
            className="transition-transform"
            classNames={{ base: 'bg-bunker-300', icon: 'text-bunker-800' }}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions">
          <DropdownItem
            key="settings"
            startContent={<UserCircle size={20} />}
            onClick={() => navigate('/profile')}
          >
            Meu perfil
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            onClick={logout}
            startContent={<SignOut size={20} />}
          >
            Sair
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
