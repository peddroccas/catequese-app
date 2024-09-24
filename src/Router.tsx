import { Routes, Route, Navigate } from 'react-router-dom'
import { Payment } from './pages/payment/Payment'
import { DefaultLayout } from './layouts/DefaultLayout'
import { Catechizings } from './pages/catechizings/Catechizings'
import { Catechists } from './pages/catechists/Catechists'
import { Rites } from './pages/rites/Rites'
import { Classrooms } from './pages/classrooms/Classrooms'
import { SignIn } from './pages/signIn/SignIn'
import { SignUp } from './pages/signUp/SignUp'

export function Router() {
  return (
    <Routes>
      <Route path="" element={<Navigate to={'/signUp'} />} />
      <Route path="/signIn" element={<SignIn />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/" element={<DefaultLayout />}>
        <Route path="payment" element={<Payment />} />
        <Route path="catechizing" element={<Catechizings />} />
        <Route path="catechist" element={<Catechists />} />
        <Route path="rites" element={<Rites />} />
        <Route path="classrooms" element={<Classrooms />} />
      </Route>
    </Routes>
  )
}
