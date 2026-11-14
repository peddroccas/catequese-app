import { coordinationContact } from '@/Types'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react'
import { ChatCircleDots } from '@phosphor-icons/react'
import { CoordinationContactsList } from './CoordinationContactsCard'

interface CoordinationHelpButtonProps {
  contacts: coordinationContact[]
}

// Botão "Dúvidas?" fixo no canto da tela: abre os contatos da coordenação sem
// tirar a família da escolha da etapa ou do formulário. Só abre quando tocado.
// Sem contatos cadastrados, não aparece
export function CoordinationHelpButton({
  contacts,
}: CoordinationHelpButtonProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  if (!contacts.length) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-emerald-600 pl-4 pr-5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-colors duration-150 hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:bottom-6 sm:right-6"
      >
        <ChatCircleDots size={22} weight="fill" />
        Dúvidas?
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="auto"
        size="sm"
        // Afastado das bordas da tela (no celular ficava colado embaixo)
        classNames={{ base: 'mx-4 mb-6 rounded-2xl sm:mx-6' }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-0.5 px-6 pt-6">
            <span className="text-lg font-semibold text-bunker-900">
              Fale com a coordenação
            </span>
            <span className="text-sm font-normal text-bunker-500">
              Dúvidas sobre a inscrição, documentos ou pagamento.
            </span>
          </ModalHeader>
          <ModalBody className="px-6 pb-7 pt-2">
            <CoordinationContactsList contacts={contacts} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
