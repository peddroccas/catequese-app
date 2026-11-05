import { Routes, Route, Navigate } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { Catechizings } from './pages/catechizings/Catechizings'
import { Catechists } from './pages/catechists/Catechists'
import { Rites } from './pages/rites/Rites'
import { Classrooms } from './pages/classrooms/Classrooms'
import { Login } from './pages/login/Login'
import Classroom from './pages/classroom/Classroom'
import { Profile } from './pages/profile/Profile'
import { Formations } from './pages/formations/Formations'
import { Archive } from './pages/archive/Archive'
import { Home } from './pages/home/Home'
import { Finances } from './pages/finances/Finances'
import { Meetings } from './pages/meetings/Meetings'
import { MeetingThemes } from './pages/meetings/MeetingThemes'

export function Router() {
  return (
    <Routes>
      <Route path="" element={<Navigate to={'/login'} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DefaultLayout />}>
        <Route path="inicio" element={<Home />} />
        <Route path="classroom" element={<Classroom />} />
        <Route path="catechizing" element={<Catechizings />} />
        <Route path="catechist" element={<Catechists />} />
        <Route path="formations" element={<Formations />} />
        <Route path="finances" element={<Finances />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="meeting-themes" element={<MeetingThemes />} />
        <Route path="rites" element={<Rites />} />
        <Route path="classrooms" element={<Classrooms />} />
        <Route path="profile" element={<Profile />} />
        <Route path="archive" element={<Archive />} />
      </Route>
    </Routes>
  )
}
