import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export function DefaultLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="my-8 flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
