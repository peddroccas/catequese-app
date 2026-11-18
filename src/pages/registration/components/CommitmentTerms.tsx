import {
  splitTermParagraph,
  termParagraphs,
  termRoleText,
} from '@/utils/commitmentTerms'
import { Checkbox } from '@nextui-org/react'

interface CommitmentTermsProps {
  // Texto da paróquia (vazio = termo padrão do sistema)
  template?: string | null
  signerName?: string
  isAdult: boolean
  catechizingName?: string
  accepted?: boolean
  onAcceptanceChange?: (accepted: boolean) => void
  error?: string
}

const BLANK = '______________'

// O termo de compromisso da paróquia, com o nome de quem assina e o vínculo
// em destaque
export function CommitmentTerms({
  template,
  signerName,
  isAdult,
  catechizingName,
  accepted = false,
  onAcceptanceChange,
  error,
}: CommitmentTermsProps) {
  return (
    <section
      data-invalid={Boolean(error)}
      className={`flex flex-col gap-3 rounded-xl border bg-white p-4 text-sm text-bunker-700 ${error ? 'border-danger' : 'border-bunker-200'}`}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
        Termo de compromisso
      </h3>
      {termParagraphs(template).map((paragraph, index) => (
        <p key={index}>
          {splitTermParagraph(paragraph).map((part, partIndex) => {
            if (part.type === 'signer') {
              return <strong key={partIndex}>{signerName || BLANK}</strong>
            }
            if (part.type === 'role') {
              return isAdult ? (
                termRoleText(true, '')
              ) : (
                <span key={partIndex}>
                  responsável por <strong>{catechizingName || BLANK}</strong>,
                </span>
              )
            }
            return part.value
          })}
        </p>
      ))}
      <Checkbox
        isSelected={accepted}
        onValueChange={onAcceptanceChange}
        isRequired
        isReadOnly={!onAcceptanceChange}
        isInvalid={Boolean(error)}
        aria-describedby={error ? 'commitment-terms-error' : undefined}
        classNames={{ label: 'text-sm font-medium text-bunker-900' }}
      >
        Li e concordo com o Termo de Compromisso
      </Checkbox>
      {error && (
        <p id="commitment-terms-error" className="text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  )
}
