import { formatCurrency } from '@/utils/currency'
import { maskPhone } from '@/utils/phone'
import { toWhatsappNumber, whatsappChatUrl } from '@/utils/whatsapp'
import { Check, Copy, Money, QrCode, WhatsappLogo } from '@phosphor-icons/react'
import { useState } from 'react'

interface RegistrationPaymentNoticeProps {
  // Taxa de inscrição em centavos; sem taxa e sem PIX, nada aparece
  feeCents: number | null | undefined
  pixKey: string | null | undefined
  pixHolderName: string | null | undefined
  // WhatsApp (só números) para onde vai o comprovante
  receiptPhone: string | null | undefined
  // Código da inscrição, quando já foi enviada: vai na mensagem do comprovante
  protocol?: string | null
  className?: string
}

function receiptMessage(protocol?: string | null) {
  return protocol
    ? `Olá! Segue o comprovante do PIX da inscrição na catequese (código ${protocol}).`
    : 'Olá! Segue o comprovante do PIX da inscrição na catequese.'
}

// Valor da inscrição, chave PIX para pagar e o pedido de mandar o comprovante
// pelo WhatsApp (escolha da etapa, formulário e confirmação)
export function RegistrationPaymentNotice({
  feeCents,
  pixKey,
  pixHolderName,
  receiptPhone,
  protocol,
  className = '',
}: RegistrationPaymentNoticeProps) {
  const [copied, setCopied] = useState(false)

  if (!feeCents && !pixKey) {
    return null
  }

  const whatsapp = receiptPhone ? toWhatsappNumber(receiptPhone) : null

  async function handleCopy() {
    if (!pixKey) {
      return
    }
    try {
      await navigator.clipboard.writeText(pixKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Sem acesso à área de transferência: a chave fica selecionável na tela
    }
  }

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 ${className}`}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          {feeCents ? (
            <Money size={26} weight="duotone" />
          ) : (
            <QrCode size={26} weight="duotone" />
          )}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {feeCents ? 'Taxa de inscrição' : 'Pagamento da inscrição'}
          </span>
          {feeCents ? (
            <span className="text-3xl font-semibold tabular-nums text-emerald-900">
              {formatCurrency(feeCents)}
            </span>
          ) : (
            <span className="text-lg font-semibold text-emerald-900">
              Pague pelo PIX
            </span>
          )}
          {!pixKey && (
            <span className="mt-1 text-sm text-emerald-800">
              Dúvidas sobre o pagamento? Fale com a coordenação.
            </span>
          )}
        </div>
      </div>

      {pixKey && (
        <>
          <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Chave PIX
            </span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="select-all break-all text-lg font-semibold text-bunker-900">
                {pixKey}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-300 px-4 text-sm font-semibold text-emerald-800 transition-colors duration-150 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                {copied ? (
                  <Check size={18} weight="bold" />
                ) : (
                  <Copy size={18} weight="bold" />
                )}
                {copied ? 'Chave copiada' : 'Copiar chave'}
              </button>
            </div>
            {pixHolderName && (
              <span className="text-sm text-bunker-600">
                Em nome de <strong>{pixHolderName}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-emerald-900">
              Depois de pagar, mande o comprovante pelo WhatsApp
              {whatsapp && receiptPhone ? (
                <>
                  {' '}
                  <strong className="tabular-nums">
                    {maskPhone(receiptPhone)}
                  </strong>
                </>
              ) : (
                ' da coordenação'
              )}
              {protocol ? (
                <>
                  , junto com o código <strong>{protocol}</strong>.
                </>
              ) : (
                ', com o nome do catequizando.'
              )}
            </p>
            {whatsapp && (
              <a
                href={whatsappChatUrl(whatsapp, receiptMessage(protocol))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <WhatsappLogo size={18} weight="bold" />
                Enviar comprovante
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}
