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
  'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600'

// Quem procurar na coordenação: nome e telefone grandes, com botões para ligar e
// chamar no WhatsApp. Sem contatos cadastrados, não aparece
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
      className={`flex flex-col gap-3 rounded-2xl border border-bunker-200/70 bg-white p-5 shadow-sm ${className}`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-bunker-500">
        Fale com a coordenação
      </h2>
      <ul className="flex flex-col divide-y divide-bunker-100">
        {contacts.map((contact, index) => {
          const whatsapp = toWhatsappNumber(contact.phone)

          return (
            <li
              key={`${contact.name}-${index}`}
              className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-semibold text-bunker-900">
                  {contact.name}
                </span>
                <span className="text-xl tabular-nums text-bunker-700">
                  {maskPhone(contact.phone)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:+55${contact.phone.replace(/\D/g, '')}`}
                  className={`${actionClassName} border border-bunker-300 text-bunker-800 hover:bg-bunker-50`}
                >
                  <Phone size={18} weight="bold" />
                  Ligar
                </a>
                {whatsapp && (
                  <a
                    href={whatsappChatUrl(whatsapp, WHATSAPP_MESSAGE)}
                    target="_blank"
                    rel="noreferrer"
                    className={`${actionClassName} bg-emerald-600 text-white hover:bg-emerald-700`}
                  >
                    <WhatsappLogo size={18} weight="bold" />
                    WhatsApp
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
