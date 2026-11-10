import {
  splitTermParagraph,
  termParagraphs,
  termRoleText,
} from '@/utils/commitmentTerms'

interface CommitmentTermsProps {
  // Texto da paróquia (vazio = termo padrão do sistema)
  template?: string | null
  signerName?: string
  isAdult: boolean
  catechizingName?: string
}

const BLANK = '______________'

// O termo de compromisso da paróquia, com o nome de quem assina e o vínculo
// em destaque
export function CommitmentTerms({
  template,
  signerName,
  isAdult,
  catechizingName,
}: CommitmentTermsProps) {
  return (
    <>
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
    </>
  )
}
