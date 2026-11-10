import { useAuth } from '@/hooks/useAuth'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@nextui-org/react'
import { Gear, ShieldCheck, SignOut, UserCircle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

export default function User() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const firstName = user?.nickname || user?.name.split(' ')[0]

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button className="flex flex-col items-center gap-1 rounded-lg px-2 py-1 duration-150 hover:bg-white/10">
          <Avatar
            as="span"
            size="sm"
            src={user?.avatarUrl ?? undefined}
            className="transition-transform"
            classNames={{ base: 'bg-bunker-300', icon: 'text-bunker-800' }}
          />
          <span className="max-w-32 truncate text-xs text-bunker-300">
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
          key="parish"
          className={user?.role === 'COORDINATOR' ? '' : 'hidden'}
          startContent={<Gear size={20} />}
          onPress={() => navigate('/parish')}
        >
          Configurações da paróquia
        </DropdownItem>
        <DropdownItem
          key="access-log"
          className={user?.role === 'COORDINATOR' ? '' : 'hidden'}
          startContent={<ShieldCheck size={20} />}
          onPress={() => navigate('/acessos')}
        >
          Registro de acessos
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
