import { Routes, Route, Navigate } from 'react-router-dom'
import { Payment } from './pages/payment/Payment'
import { DefaultLayout } from './layouts/DefaultLayout'
import { Catechizings } from './pages/catechizings/Catechizings'
import { Catechists } from './pages/catechists/Catechists'
import { Rites } from './pages/rites/Rites'
import { Classrooms } from './pages/classrooms/Classrooms'
import { InstallmentProvider } from './contexts/InstallmentContext'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route path="" element={<Navigate to={'payment'} />} />
        <Route
          path="payment"
          element={
            <InstallmentProvider>
              <Payment />
            </InstallmentProvider>
          }
        />
        <Route path="catechizing" element={<Catechizings />} />
        <Route path="catechist" element={<Catechists />} />
        <Route path="rites" element={<Rites />} />
        <Route path="classrooms" element={<Classrooms />} />
      </Route>
    </Routes>
  )
}
