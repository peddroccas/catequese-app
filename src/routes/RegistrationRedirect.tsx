import { PageFallback } from '@/components/PageFallback'
import { DEFAULT_PARISH_SLUG } from '@/lib/config'
import { useHostParish } from '@/hooks/useHostParish'
import { Navigate } from 'react-router-dom'

// /inscricao sem slug: em endereço de paróquia vai para a dela; no endereço
// genérico, para a paróquia padrão (links antigos continuam valendo)
export function RegistrationRedirect() {
  const { parish, isLoading } = useHostParish()

  if (isLoading) return <PageFallback />

  return (
    <Navigate
      to={`/inscricao/${parish?.slug ?? DEFAULT_PARISH_SLUG}`}
      replace
    />
  )
}
