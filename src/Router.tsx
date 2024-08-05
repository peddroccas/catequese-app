import { Routes, Route } from 'react-router-dom'
import { Payment } from './pages/payment/Payment'

export function Router() {
  return (
    <Routes>
      <Route path="/payment" element={<Payment />} />
    </Routes>
  )
}
