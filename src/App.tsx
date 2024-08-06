import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router'
import { PeopleContextProvider } from './context/PeopleContext'

export function App() {
  return (
    <PeopleContextProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </PeopleContextProvider>
  )
}
