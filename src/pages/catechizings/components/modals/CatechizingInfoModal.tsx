import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { RegistrationRepository } from '@/services/repositories/registrationRepository'
import { catechizing, registration } from '@/Types'
import { RegistrationDocuments } from '@/pages/registrations/components/RegistrationDocuments'
import { CatechizingForm } from '../CatechizingForm'

interface CatechizingInfoProps {
  data: catechizing
  isOpen: boolean
  onClose: () => void
}

export function CatechizingInfoModal({
  data,
  isOpen,
  onClose,
}: CatechizingInfoProps) {
  const { user } = useAuth()
  const [registration, setRegistration] = useState<registration | null>(null)

  // Só a coordenação vê os documentos, e só de quem veio por inscrição
  useEffect(() => {
    if (isOpen && user?.role === 'COORDINATOR' && data.id) {
      RegistrationRepository.getByCatechizing(data.id).then(setRegistration)
    }
  }, [isOpen, user?.role, data.id])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top"
      size="2xl"
      scrollBehavior="outside"
      className="py-2"
    >
      <ModalContent>
        <ModalHeader className="text-xl font-semibold text-bunker-900">
          Catequizando
        </ModalHeader>
        <ModalBody>
          <CatechizingForm data={data} isReadOnly />
          {registration && (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
                Documentos da inscrição
              </h3>
              <RegistrationDocuments registration={registration} />
            </section>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
