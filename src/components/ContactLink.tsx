import { Link, useLocation } from 'react-router-dom'

export function ContactLink() {
  const location = useLocation()
  return (
    <Link
      to="/contato"
      state={{ sourcePath: location.pathname }}
      className="text-sm font-medium text-bunker-700 underline underline-offset-4 hover:text-bunker-900"
    >
      Fale conosco · relatar um problema
    </Link>
  )
}
