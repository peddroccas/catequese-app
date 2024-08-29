import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router'
import { ClassroomProvider } from './contexts/ClassroomContext'

export function App() {
  return (
    <ClassroomProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ClassroomProvider>
  )
}
