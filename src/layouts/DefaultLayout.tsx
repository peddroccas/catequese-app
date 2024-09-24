import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'

export function DefaultLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bunker-950">
      <Header />
      <Outlet />
    </div>
  )
}
