import { Link } from 'react-router-dom'

export function PrivacyPolicyLink({ newTab = false }: { newTab?: boolean }) {
  return (
    <Link
      to="/privacidade"
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
      className="text-sm font-medium text-bunker-700 underline underline-offset-4 hover:text-bunker-900"
    >
      Política de Privacidade
    </Link>
  )
}
