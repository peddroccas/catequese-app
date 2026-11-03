import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  children?: ReactNode
}

// Título da página à esquerda e ações à direita
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-bunker-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-bunker-500">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  )
}
