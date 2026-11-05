import { catechizing } from '@/Types'
import {
  ArrowsLeftRight,
  FilePdf,
  Info,
  PencilSimple,
  Archive,
} from '@phosphor-icons/react'
import { useContext, useState } from 'react'
import { EditCatechizingModal } from './modals/EditCatechizingModal'
import { TransferModal } from '@/components/TransferModal'
import { ArchiveCatechizingModal } from './modals/ArchiveCatechizingModal'
import { CatechizingInfoModal } from './modals/CatechizingInfoModal'
import { useAuth } from '@/hooks/useAuth'
import { RowAction } from '@/components/IconButton'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import {
  describeSkipped,
  downloadCatechizingPackage,
} from '@/utils/registrationPdf'
import { getErrorMessage } from '@/services/api'

interface ToolBarProps {
  catechizing: catechizing
  // No arquivo só dá para ver os dados
  isReadOnly?: boolean
}
export default function ToolBar({ catechizing, isReadOnly }: ToolBarProps) {
  const { user } = useAuth()
  const { classrooms } = useContext(ClassroomContext)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  // Por padrão a ficha sai já com os documentos, num PDF só (sem documentos
  // cadastrados, sai só a ficha)
  async function exportWithDocuments() {
    if (isExporting) {
      return
    }
    setIsExporting(true)
    try {
      const result = await downloadCatechizingPackage(
        catechizing,
        'pdf',
        classrooms.find(
          (classroom) => classroom.id === catechizing.classroomId,
        ),
      )
      if (result.skipped.length) {
        alert(describeSkipped(result.skipped))
      }
    } catch (error) {
      alert(getErrorMessage(error))
    } finally {
      setIsExporting(false)
    }
  }
  const [isUserEditingCatechizing, setIsUserEditingCatechizing] =
    useState<boolean>(false)
  const [isUserArchivingCatechizing, setIsUserArchivingCatechizing] =
    useState<boolean>(false)
  const [isUserTransferingCatechizing, setIsUserTransferingatechizing] =
    useState<boolean>(false)
  const [isUserSeeingCatechizingInfo, setIsUserSeeingCatechizingInfo] =
    useState<boolean>(false)
  return (
    <div className="flex items-center justify-center gap-0.5">
      <CatechizingInfoModal
        isOpen={isUserSeeingCatechizingInfo}
        onClose={() => setIsUserSeeingCatechizingInfo(false)}
        data={catechizing}
      />
      <ArchiveCatechizingModal
        data={catechizing}
        isOpen={isUserArchivingCatechizing}
        onClose={() => setIsUserArchivingCatechizing(false)}
      />
      <EditCatechizingModal
        isOpen={isUserEditingCatechizing}
        data={catechizing}
        onClose={() => setIsUserEditingCatechizing(false)}
      />
      <TransferModal
        data={catechizing}
        isOpen={isUserTransferingCatechizing}
        onClose={() => setIsUserTransferingatechizing(false)}
      />
      <RowAction
        label="Ver dados"
        icon={<Info size={18} />}
        onPress={() => setIsUserSeeingCatechizingInfo(true)}
      />
      {/* A ficha impressa é só da coordenação (também no arquivo) */}
      {user?.role === 'COORDINATOR' && (
        <RowAction
          label="Ficha com documentos (PDF)"
          icon={<FilePdf size={18} />}
          onPress={exportWithDocuments}
        />
      )}
      {user?.role === 'COORDINATOR' && !isReadOnly && (
        <>
          <RowAction
            label="Editar"
            icon={<PencilSimple size={18} />}
            onPress={() => setIsUserEditingCatechizing(true)}
          />
          <RowAction
            label="Transferir de turma"
            icon={<ArrowsLeftRight size={18} />}
            onPress={() => setIsUserTransferingatechizing(true)}
          />
          <RowAction
            label="Arquivar"
            variant="danger"
            icon={<Archive size={18} />}
            onPress={() => setIsUserArchivingCatechizing(true)}
          />
        </>
      )}
    </div>
  )
}
