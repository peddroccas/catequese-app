import { useAuth } from '@/hooks/useAuth'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@heroui/react'
import { SignOut, UserCircle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { UpdateCatechistModal } from './updatePasswordDialog'
import { useState } from 'react'

export default function User() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const { logout } = useAuth()
  return (
    <div className="flex items-center gap-4">
      <UpdateCatechistModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
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
            onPress={() => setIsOpen(true)}
            key="settings"
            startContent={<UserCircle size={20} />}
          >
            Mudar senha
          </DropdownItem>

          <DropdownItem
            key="logout"
            color="danger"
            onPress={logout}
            startContent={<SignOut size={20} />}
          >
            Sair
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
