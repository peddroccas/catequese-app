import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router'
import { ClassroomProvider } from './contexts/ClassroomContext'
import { AuthProvider } from './contexts/AuthContext'
import { Analytics } from '@vercel/analytics/react'
import { ToastViewport } from './components/ToastViewport'

export function App() {
  return (
    <AuthProvider>
      <Analytics />
      <ToastViewport />
      <ClassroomProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </ClassroomProvider>
    </AuthProvider>
  )
}
