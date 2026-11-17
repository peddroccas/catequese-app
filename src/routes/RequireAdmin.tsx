import { AdminRepository } from '@/services/repositories/adminRepository'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// Guarda do painel do administrador: sem token vai para o login dele. Se o
// token estiver vencido, a primeira chamada à API devolve 401 e o cliente
// (adminApi) já leva para o login
export function RequireAdmin() {
  const location = useLocation()
  if (!AdminRepository.hasToken()) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  return <Outlet />
}
