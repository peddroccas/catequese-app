import { publicParish } from '@/Types'

type ReceiptContact = Pick<
  publicParish,
  'paymentReceiptPhone' | 'coordinationContacts'
>
type PaymentSettings = ReceiptContact &
  Pick<publicParish, 'registrationFeeCents' | 'pixKey' | 'pixHolderName'>

// WhatsApp do comprovante: o que a paróquia cadastrou ou o primeiro contato da
// coordenação
export function receiptPhoneOf(parish: ReceiptContact) {
  return (
    parish.paymentReceiptPhone ?? parish.coordinationContacts[0]?.phone ?? null
  )
}

export function paymentNoticePropsOf(
  parish: PaymentSettings | null | undefined,
) {
  return {
    feeCents: parish?.registrationFeeCents,
    pixKey: parish?.pixKey,
    pixHolderName: parish?.pixHolderName,
    receiptPhone: parish ? receiptPhoneOf(parish) : null,
  }
}
