import { ParishContext } from '@/contexts/ParishContext'
import { useContext } from 'react'

export function useParish() {
  return useContext(ParishContext)
}
