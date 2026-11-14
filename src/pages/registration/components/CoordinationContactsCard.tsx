import { coordinationContact } from '@/Types'
import { maskPhone } from '@/utils/phone'
import { toWhatsappNumber, whatsappChatUrl } from '@/utils/whatsapp'
import { Phone, WhatsappLogo } from '@phosphor-icons/react'

interface CoordinationContactsCardProps {
  contacts: coordinationContact[]
  className?: string
}

const WHATSAPP_MESSAGE = 'Olá! Tenho uma dúvida sobre a inscrição na catequese.'

const actionClassName =
  'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600'

// Nome e telefone de cada contato, com botões para ligar e chamar no WhatsApp
// (no card e na janela do botão "Dúvidas?")
export function CoordinationContactsList({
  contacts,
}: {
  contacts: coordinationContact[]
}) {
  return (
    <ul className="flex flex-col divide-y divide-bunker-100">
      {contacts.map((contact, index) => {
        const whatsapp = toWhatsappNumber(contact.phone)

        return (
          <li
            key={`${contact.name}-${index}`}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2 first:pt-0 last:pb-0"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-bunker-900">
                {contact.name}
              </span>
              <span className="text-sm tabular-nums text-bunker-700">
                {maskPhone(contact.phone)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:+55${contact.phone.replace(/\D/g, '')}`}
                className={`${actionClassName} border border-bunker-300 text-bunker-800 hover:bg-bunker-50`}
              >
                <Phone size={14} weight="bold" />
                Ligar
              </a>
              {whatsapp && (
                <a
                  href={whatsappChatUrl(whatsapp, WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noreferrer"
                  className={`${actionClassName} bg-emerald-600 text-white hover:bg-emerald-700`}
                >
                  <WhatsappLogo size={14} weight="bold" />
                  WhatsApp
                </a>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// Quem procurar na coordenação, num card aberto na página (inscrições
// encerradas e inscrição enviada). Sem contatos cadastrados, não aparece
export function CoordinationContactsCard({
  contacts,
  className = '',
}: CoordinationContactsCardProps) {
  if (!contacts.length) {
    return null
  }

  return (
    <section
      aria-label="Contatos da coordenação"
      className={`flex flex-col gap-2 rounded-xl border border-bunker-200/70 bg-white px-4 py-3 shadow-sm ${className}`}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
        Fale com a coordenação
      </h2>
      <CoordinationContactsList contacts={contacts} />
    </section>
  )
}
