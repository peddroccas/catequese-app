import { publicParish } from '@/Types'
import { resolveHostParish } from '@/utils/hostParish'
import { useEffect, useState } from 'react'

// A paróquia do endereço atual (null no endereço genérico); isLoading só
// enquanto a primeira resposta não chega
export function useHostParish() {
  const [state, setState] = useState<{
    parish: publicParish | null
    isLoading: boolean
  }>({ parish: null, isLoading: true })

  useEffect(() => {
    let isCurrent = true
    resolveHostParish().then((parish) => {
      if (isCurrent) setState({ parish, isLoading: false })
    })
    return () => {
      isCurrent = false
    }
  }, [])

  return state
}
