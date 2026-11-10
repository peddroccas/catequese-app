import { ComponentType, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DEFAULT_PARISH_SLUG } from './lib/config'
import { PageFallback } from './components/PageFallback'
import { DefaultLayout } from './layouts/DefaultLayout'
import { Login } from './pages/login/Login'
import { RequireAuth } from './routes/RequireAuth'

// Cada tela vira um arquivo separado, baixado só quando a pessoa abre: o
// primeiro carregamento fica leve (PDF e planilha ficam fora dele)
function page<T extends Record<string, unknown>>(
  load: () => Promise<T>,
  name: keyof T,
) {
  return lazy(async () => ({
    default: (await load())[name] as ComponentType,
  }))
}

const Home = page(() => import('./pages/home/Home'), 'Home')
const Classroom = page(() => import('./pages/classroom/Classroom'), 'Classroom')
const Catechizings = page(
  () => import('./pages/catechizings/Catechizings'),
  'Catechizings',
)
const Catechists = page(
  () => import('./pages/catechists/Catechists'),
  'Catechists',
)
const Registrations = page(
  () => import('./pages/registrations/Registrations'),
  'Registrations',
)
const Formations = page(
  () => import('./pages/formations/Formations'),
  'Formations',
)
const Finances = page(() => import('./pages/finances/Finances'), 'Finances')
const Meetings = page(() => import('./pages/meetings/Meetings'), 'Meetings')
const MeetingThemes = page(
  () => import('./pages/meetings/MeetingThemes'),
  'MeetingThemes',
)
const Rites = page(() => import('./pages/rites/Rites'), 'Rites')
const Classrooms = page(
  () => import('./pages/classrooms/Classrooms'),
  'Classrooms',
)
const ParishSettings = page(
  () => import('./pages/parish/ParishSettings'),
  'ParishSettings',
)
const Profile = page(() => import('./pages/profile/Profile'), 'Profile')
const Archive = page(() => import('./pages/archive/Archive'), 'Archive')
const Registration = page(
  () => import('./pages/registration/Registration'),
  'Registration',
)

export function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="" element={<Navigate to={'/login'} />} />
        <Route path="/login" element={<Login />} />
        {/* Formulário público: não precisa de login */}
        <Route path="/inscricao/:slug" element={<Registration />} />
        {/* Endereço antigo (sem slug): vai para a paróquia padrão */}
        <Route
          path="/inscricao"
          element={
            <Navigate to={`/inscricao/${DEFAULT_PARISH_SLUG}`} replace />
          }
        />
        {/* Telas internas: só com login (e, para catequista, só as permitidas) */}
        <Route element={<RequireAuth />}>
          <Route element={<DefaultLayout />}>
            <Route path="inicio" element={<Home />} />
            <Route path="classroom" element={<Classroom />} />
            <Route path="catechizing" element={<Catechizings />} />
            <Route path="catechist" element={<Catechists />} />
            <Route path="inscricoes" element={<Registrations />} />
            <Route path="formations" element={<Formations />} />
            <Route path="finances" element={<Finances />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="meeting-themes" element={<MeetingThemes />} />
            <Route path="rites" element={<Rites />} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route path="parish" element={<ParishSettings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="archive" element={<Archive />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
