import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router'
import { ClassroomProvider } from './contexts/ClassroomContext'
import { AuthProvider } from './contexts/AuthContext'
import { HeroUIProvider } from '@heroui/react'
import { Analytics } from '@vercel/analytics/react'

export function App() {
  return (
    <AuthProvider>
      <Analytics />
      <ClassroomProvider>
        <BrowserRouter>
          <HeroUIProvider>
            <Router />
          </HeroUIProvider>
        </BrowserRouter>
      </ClassroomProvider>
    </AuthProvider>
  )
}
