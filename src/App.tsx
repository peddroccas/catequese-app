import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router'
import { ClassroomProvider } from './contexts/ClassroomContext'
import { AuthProvider } from './contexts/AuthContext'

export function App() {
  return (
    <AuthProvider>
      <ClassroomProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </ClassroomProvider>
    </AuthProvider>
  )
}
