import { Button } from '@nextui-org/react'
import { useState } from 'react'

interface TemporaryPasswordNoticeProps {
  name: string
  password: string
}

// A senha temporária só aparece uma vez (o servidor guarda apenas o hash),
// então a coordenação precisa copiar e passar ao catequista agora
export function TemporaryPasswordNotice({
  name,
  password,
}: TemporaryPasswordNoticeProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-bunker-200 bg-bunker-50 p-4">
      <p className="text-sm text-bunker-700">
        Senha temporária de <strong>{name}</strong>. Ela aparece só agora: passe
        ao catequista, que será obrigado a trocar no primeiro acesso.
      </p>
      <div className="flex items-center gap-2">
        <code className="select-all rounded bg-white px-3 py-2 text-lg font-semibold tracking-wider text-bunker-900">
          {password}
        </code>
        <Button size="sm" variant="bordered" onPress={handleCopy}>
          {copied ? 'Copiada' : 'Copiar'}
        </Button>
      </div>
    </div>
  )
}
