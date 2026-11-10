import { coordinationContact } from '@/Types'
import { getCurrentParish } from '@/utils/parish'
import { maskPhone } from '@/utils/phone'

interface CoordinationContactsProps {
  // Sem a lista, usa os contatos da paróquia em uso
  contacts?: coordinationContact[]
}

// Telefones da coordenação, com link para ligar no celular
export function CoordinationContacts({
  contacts = getCurrentParish()?.coordinationContacts ?? [],
}: CoordinationContactsProps) {
  if (!contacts.length) {
    return <>fale com a coordenação da paróquia</>
  }

  return (
    <>
      {contacts.map((contact, index) => (
        <span key={`${contact.name}-${index}`}>
          {index > 0 && ' · '}
          {contact.name}{' '}
          <a
            href={`tel:+55${contact.phone.replace(/\D/g, '')}`}
            className="whitespace-nowrap underline underline-offset-2"
          >
            {maskPhone(contact.phone)}
          </a>
        </span>
      ))}
    </>
  )
}
