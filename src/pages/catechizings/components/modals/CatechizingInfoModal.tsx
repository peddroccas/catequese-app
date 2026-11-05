import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import { FilePdf } from '@phosphor-icons/react'
import { useContext } from 'react'
import { PackageMenu } from '@/components/PackageMenu'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { useAuth } from '@/hooks/useAuth'
import { catechizing } from '@/Types'
import {
  downloadCatechizingPackage,
  downloadCatechizingPdf,
} from '@/utils/registrationPdf'
import { CatechizingDocuments } from '../CatechizingDocuments'
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
  const { classrooms } = useContext(ClassroomContext)
  const isCoordinator = user?.role === 'COORDINATOR'

  const classroom = classrooms.find((item) => item.id === data.classroomId)

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
          {/* Só a coordenação vê os documentos, e aqui só para consultar:
              cadastrar, trocar e remover ficam no editar */}
          {isOpen && isCoordinator && data.id && (
            <CatechizingDocuments catechizing={data} isReadOnly />
          )}
        </ModalBody>
        <ModalFooter
          className={
            isCoordinator ? 'items-start justify-between' : 'justify-end'
          }
        >
          {/* A ficha e os documentos são só da coordenação */}
          {isCoordinator && (
            <div className="flex flex-wrap items-start gap-2">
              <Button
                variant="flat"
                startContent={<FilePdf size={18} />}
                onPress={() => downloadCatechizingPdf(data, classroom)}
              >
                Ficha em PDF
              </Button>
              <PackageMenu
                onDownload={(format) =>
                  downloadCatechizingPackage(data, format, classroom)
                }
              />
            </div>
          )}
          <Button variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
