import { useParish } from '@/hooks/useParish'
import { parishPlace } from '@/utils/parish'
import { Church } from '@phosphor-icons/react'

// Faixa logo abaixo do cabeçalho com a paróquia em que a pessoa está, com a
// cidade (pode haver uma Aparecida no Gama e outra no Plano Piloto).
// Fica fora do cabeçalho para não disputar espaço com a logo e o menu
export function ParishBar() {
  const { parish } = useParish()

  if (!parish) return null

  const place = parishPlace(parish)

  return (
    <div className="border-b border-creme-200 bg-creme-50">
      {/* Nome inteiro, sem cortar: no celular a cidade desce para a linha de baixo */}
      <div className="mx-auto flex max-w-screen-2xl items-start gap-2 px-4 py-2 text-sm sm:px-8">
        <Church
          size={16}
          weight="duotone"
          className="mt-0.5 shrink-0 text-ouro-600"
          aria-hidden
        />
        <span className="flex min-w-0 flex-wrap gap-x-1.5 leading-snug">
          <span className="font-semibold text-bunker-700">{parish.name}</span>
          {place && (
            <span className="whitespace-nowrap text-bunker-500">· {place}</span>
          )}
        </span>
      </div>
    </div>
  )
}
