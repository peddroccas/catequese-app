import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export function Rites() {
  const auth = useAuth()

  useEffect(() => {
    auth()
  })
  return (
    <div>
      <p>Ritos</p>
    </div>
  )
}
