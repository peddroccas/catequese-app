import { Button, Tooltip } from '@nextui-org/react'
import { ReactNode } from 'react'

interface IconButtonProps {
  label: string
  icon: ReactNode
  onPress: () => void
  variant?: 'default' | 'danger'
  isDisabled?: boolean
}

const iconButtonVariants = {
  default: 'text-bunker-700 hover:border-bunker-300 hover:bg-bunker-50',
  danger:
    'text-bunker-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600',
}

// Botão quadrado com ícone e tooltip usado nas barras de ações
export function IconButton({
  label,
  icon,
  onPress,
  variant = 'default',
  isDisabled,
}: IconButtonProps) {
  return (
    <Tooltip content={label} closeDelay={0}>
      <Button
        isIconOnly
        aria-label={label}
        onPress={onPress}
        isDisabled={isDisabled}
        variant="bordered"
        className={`h-9 w-9 min-w-9 border-1 border-bunker-200 bg-white shadow-sm duration-150 sm:h-10 sm:w-10 sm:min-w-10 ${iconButtonVariants[variant]}`}
      >
        {icon}
      </Button>
    </Tooltip>
  )
}

interface RowActionProps {
  label: string
  icon: ReactNode
  onPress: () => void
  variant?: 'default' | 'danger'
}

// Ação pequena dentro das linhas das tabelas
export function RowAction({
  label,
  icon,
  onPress,
  variant = 'default',
}: RowActionProps) {
  return (
    <Tooltip content={label} closeDelay={0}>
      <button
        type="button"
        aria-label={label}
        onClick={onPress}
        className={`rounded-lg p-1.5 text-bunker-500 duration-150 ${
          variant === 'danger'
            ? 'hover:bg-red-50 hover:text-red-600'
            : 'hover:bg-bunker-100 hover:text-bunker-800'
        }`}
      >
        {icon}
      </button>
    </Tooltip>
  )
}
