import { PageFallback } from '@/components/PageFallback'
import { useAuth } from '@/hooks/useAuth'
import { useParish } from '@/hooks/useParish'
import { isPathEnabled, moduleOfPath } from '@/utils/modules'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { memberPaths } from './access'

// Guarda das telas internas. Decide antes de desenhar qualquer coisa, então a
// tela não pisca para quem não pode vê-la
export function RequireAuth() {
  const { user, isCheckingLocalStorage, mustChangePassword } = useAuth()
  const { pathname } = useLocation()
  const { parish } = useParish()

  // Ainda conferindo se há login salvo no navegador
  if (isCheckingLocalStorage) {
    return <PageFallback />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  // Enquanto a senha for temporária, só o perfil (onde ela é trocada) abre
  if (mustChangePassword && pathname !== '/profile') {
    return <Navigate to="/profile" replace />
  }
  if (user.role === 'MEMBER' && !memberPaths.includes(pathname)) {
    return <Navigate to="/classroom" replace />
  }

  // Aba desligada pelo administrador para a paróquia: volta ao início. Enquanto a
  // paróquia não carrega, não dá para saber, então espera (sem piscar a tela)
  if (moduleOfPath(pathname)) {
    if (!parish) {
      return <PageFallback />
    }
    if (!isPathEnabled(pathname, parish)) {
      return <Navigate to="/inicio" replace />
    }
  }

  return <Outlet />
}
