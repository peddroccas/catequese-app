import { Routes, Route, Navigate } from 'react-router-dom'
import { Payment } from './pages/payment/Payment'
import { DefaultLayout } from './layouts/DefaultLayout'
import { Catechizing } from './pages/catechizing/Catechizing'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route path="" element={<Navigate to={'payment'} />} />
        <Route path="payment" element={<Payment />} />
        <Route path="catechizing" element={<Catechizing />} />
      </Route>
    </Routes>
  )
}
