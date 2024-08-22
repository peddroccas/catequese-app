import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router'
import { DataProvider } from './contexts/DataContext'

export function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </DataProvider>
  )
}
