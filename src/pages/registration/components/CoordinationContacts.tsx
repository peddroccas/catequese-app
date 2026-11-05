import { coordinationContacts } from '@/utils/registration'

// Telefones da coordenação, com link para ligar no celular
export function CoordinationContacts() {
  return (
    <>
      {coordinationContacts.map((contact, index) => (
        <span key={contact.name}>
          {index > 0 && ' · '}
          {contact.name}{' '}
          <a
            href={`tel:+55${contact.phone.replace(/\D/g, '')}`}
            className="whitespace-nowrap underline underline-offset-2"
          >
            {contact.phone}
          </a>
        </span>
      ))}
    </>
  )
}
