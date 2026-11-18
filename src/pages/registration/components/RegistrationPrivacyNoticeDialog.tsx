import { PrivacyPolicyLink } from '@/components/PrivacyPolicyLink'
import { registrationPrivacyNotice } from '@/Types'
import { toWhatsappNumber, whatsappChatUrl } from '@/utils/whatsapp'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'

interface RegistrationPrivacyNoticeDialogProps {
  notice: registrationPrivacyNotice
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistrationPrivacyNoticeDialog({
  notice,
  isOpen,
  onOpenChange,
}: RegistrationPrivacyNoticeDialogProps) {
  const whatsapp = toWhatsappNumber(notice.whatsappPhone)

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Aviso de Privacidade</ModalHeader>
            <ModalBody className="gap-4 text-sm text-bunker-700">
              {notice.sections.map(({ title, text }) => (
                <section key={title}>
                  <h3 className="mb-1 font-semibold text-bunker-900">{title}</h3>
                  <p className="whitespace-pre-line">{text}</p>
                </section>
              ))}
              {whatsapp ? (
                <a
                  href={whatsappChatUrl(
                    whatsapp,
                    'Olá! Gostaria de tratar de um pedido de privacidade sobre a inscrição na catequese.',
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit font-medium underline underline-offset-4"
                >
                  Falar com a coordenação pelo WhatsApp
                </a>
              ) : (
                <a
                  href="mailto:contato@catequesehub.com.br"
                  className="w-fit font-medium underline underline-offset-4"
                >
                  Falar com o Catequese Hub sobre privacidade
                </a>
              )}
              <div>
                <PrivacyPolicyLink newTab />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="flat" onPress={onClose}>
                Voltar à inscrição
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
