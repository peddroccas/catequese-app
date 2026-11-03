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
  const { user, logout } = useAuth()
  const firstName = user?.nickname || user?.name.split(' ')[0]

  return (
    <Dropdown placement="bottom-end" className="bg-bunker-900">
      <DropdownTrigger>
        <button className="flex flex-col items-center gap-1 rounded-lg px-2 py-1 duration-150 hover:bg-bunker-800">
          <Avatar
            as="span"
            size="sm"
            className="transition-transform"
            classNames={{ base: 'bg-bunker-300', icon: 'text-bunker-800' }}
          />
          <span className="max-w-32 truncate text-xs text-bunker-200">
            Olá, {firstName}
          </span>
        </button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Ações do perfil">
        <DropdownItem
          key="profile"
          startContent={<UserCircle size={20} />}
          onPress={() => navigate('/profile')}
        >
          Meu perfil
        </DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
          onPress={() => {
            logout()
            navigate('/login')
          }}
          startContent={<SignOut size={20} />}
        >
          Sair
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
