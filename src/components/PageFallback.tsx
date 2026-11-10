import { Spinner } from '@nextui-org/react'

// Mostrado enquanto uma tela é carregada
export function PageFallback() {
  return (
    <div className="flex flex-grow items-center justify-center py-24">
      <Spinner label="Carregando" />
    </div>
  )
}
