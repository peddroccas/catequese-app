import { publicParish } from '@/Types'

// WhatsApp do comprovante: o que a paróquia cadastrou ou o primeiro contato da
// coordenação
export function receiptPhoneOf(parish: publicParish) {
  return (
    parish.paymentReceiptPhone ?? parish.coordinationContacts[0]?.phone ?? null
  )
}

// Atalho para as telas públicas: tira da paróquia tudo que o aviso precisa
export function paymentNoticePropsOf(parish: publicParish | null | undefined) {
  return {
    feeCents: parish?.registrationFeeCents,
    pixKey: parish?.pixKey,
    pixHolderName: parish?.pixHolderName,
    receiptPhone: parish ? receiptPhoneOf(parish) : null,
  }
}
