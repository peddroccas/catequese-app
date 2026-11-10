import { PackageMenu } from '@/components/PackageMenu'
import { fieldsetClassName, legendClassName } from '@/components/tableStyles'
import { ClassroomContext } from '@/contexts/ClassroomContext'
import { getErrorMessage } from '@/services/api'
import { RegistrationRepository } from '@/services/repositories/registrationRepository'
import { classroom, registration } from '@/Types'
import { calculateAge, formatDate, formatTimestamp } from '@/utils/date'
import { getCurrentParish } from '@/utils/parish'
import { maskPhone } from '@/utils/phone'
import {
  ageRangeLabel,
  getRegistrationSegment,
  isAgeOutOfRange,
} from '@/utils/registration'
import {
  downloadRegistrationPackage,
  downloadRegistrationPdf,
} from '@/utils/registrationPdf'
import {
  registrationApprovedMessage,
  registrationRejectedMessage,
  toWhatsappNumber,
  whatsappChatUrl,
} from '@/utils/whatsapp'
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react'
import {
  CheckCircle,
  FilePdf,
  Warning,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { ReactNode, useContext, useState } from 'react'
import { RegistrationDocuments } from './RegistrationDocuments'

interface RegistrationModalProps {
  registration: registration
  isOpen: boolean
  onClose: () => void
  // Chamado depois de aprovar ou recusar, para a lista recarregar
  onReviewed: () => void
}

type reviewResult =
  | { kind: 'approved'; classroom: classroom }
  | { kind: 'rejected'; reason: string }

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-semibold uppercase tracking-wide text-bunker-500">
        {label}
      </dt>
      <dd className="text-sm text-bunker-900">{children || '-'}</dd>
    </div>
  )
}

function yesNo(value: boolean | null) {
  if (value === null) {
    return '-'
  }
  return value ? 'Sim' : 'Não'
}

export function RegistrationModal({
  registration,
  isOpen,
  onClose,
  onReviewed,
}: RegistrationModalProps) {
  const {
    classrooms,
    catechizings,
    throwCatechizingUpdate,
    throwClassroomUpdate,
  } = useContext(ClassroomContext)
  const info = getRegistrationSegment(registration.segment)
  const age = calculateAge(registration.birthday)
  const isPending = registration.status === 'PENDING'

  const [classroomId, setClassroomId] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<reviewResult>()

  // Só turmas da etapa que a pessoa escolheu na inscrição
  const options = classrooms.filter(
    (item) =>
      item.segment &&
      info.classroomSegments.includes(item.segment) &&
      !item.archivedAt,
  )

  const contact = registration.parents[0]
  const contactNumber = contact ? toWhatsappNumber(contact.phone) : null

  async function approve() {
    const chosen = options.find((item) => item.id === classroomId)
    if (!chosen) {
      return
    }
    setIsSaving(true)
    setError('')
    try {
      await RegistrationRepository.approve(registration.id, classroomId)
      throwCatechizingUpdate()
      throwClassroomUpdate()
      onReviewed()
      setResult({ kind: 'approved', classroom: chosen })
    } catch (approveError) {
      setError(getErrorMessage(approveError))
    } finally {
      setIsSaving(false)
    }
  }

  async function reject() {
    const trimmed = reason.trim()
    if (trimmed.length < 3) {
      setError('Explique o que precisa ser corrigido')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      await RegistrationRepository.reject(registration.id, trimmed)
      onReviewed()
      setResult({ kind: 'rejected', reason: trimmed })
    } catch (rejectError) {
      setError(getErrorMessage(rejectError))
    } finally {
      setIsSaving(false)
    }
  }

  function openWhatsapp() {
    if (!result || !contact || !contactNumber) {
      return
    }
    const message =
      result.kind === 'approved'
        ? registrationApprovedMessage(
            contact.name,
            registration.name,
            result.classroom,
          )
        : registrationRejectedMessage(
            contact.name,
            registration.name,
            registration.protocol,
            result.reason,
            `${window.location.origin}/inscricao/${getCurrentParish()?.slug ?? ''}`,
          )
    window.open(whatsappChatUrl(contactNumber, message), '_blank', 'noopener')
  }

  // Onde o catequizando foi parar (inscrições já aprovadas)
  const approvedClassroom = (() => {
    const catechizing = catechizings.find(
      (item) => item.id === registration.catechizingId,
    )
    return classrooms.find((item) => item.id === catechizing?.classroomId)
  })()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top"
      size="3xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-bunker-900">
          <span className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            {registration.name}
            <Chip size="sm" variant="flat">
              {info.title}
            </Chip>
            {registration.status === 'APPROVED' && (
              <Chip size="sm" color="success" variant="flat">
                Aprovada
              </Chip>
            )}
            {registration.status === 'REJECTED' && (
              <Chip size="sm" color="danger" variant="flat">
                Recusada
              </Chip>
            )}
          </span>
          <span className="text-sm font-normal text-bunker-500">
            Código {registration.protocol} · enviada em{' '}
            {formatTimestamp(registration.createdAt)}
          </span>
        </ModalHeader>

        <ModalBody className="gap-5">
          {result ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle
                size={44}
                weight="fill"
                className={
                  result.kind === 'approved'
                    ? 'text-emerald-500'
                    : 'text-amber-500'
                }
              />
              <p className="text-lg font-semibold text-bunker-900">
                {result.kind === 'approved'
                  ? `${registration.name} foi para a turma ${result.classroom.name ?? result.classroom.location}`
                  : 'Inscrição recusada'}
              </p>
              <p className="max-w-md text-sm text-bunker-500">
                {contactNumber
                  ? 'Avise a família pelo WhatsApp: a mensagem já vem pronta, é só enviar.'
                  : 'O telefone do responsável não é válido para o WhatsApp. Avise a família por outro meio.'}
              </p>
              <Button
                color="primary"
                startContent={<WhatsappLogo size={18} />}
                isDisabled={!contactNumber}
                onPress={openWhatsapp}
              >
                Avisar {contact?.name.split(' ')[0] ?? 'a família'} no WhatsApp
              </Button>
            </div>
          ) : (
            <>
              {isAgeOutOfRange(info, age) && (
                <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <Warning size={18} className="mt-0.5 shrink-0" />
                  <span>
                    A idade ({age} anos) está fora da faixa da etapa{' '}
                    {info.title} ({ageRangeLabel(info)}). Confira antes de
                    aprovar.
                  </span>
                </p>
              )}

              <fieldset className={fieldsetClassName}>
                <legend className={legendClassName}>Dados</legend>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Nascimento">
                    {formatDate(registration.birthday)}
                    {age !== undefined && ` (${age} anos)`}
                  </Field>
                  <Field label="Endereço">{registration.address}</Field>
                  <Field label="Necessidade especial">
                    {registration.personWithSpecialNeeds
                      ? `Sim – ${registration.specialNeedsDescription ?? ''}`
                      : 'Não'}
                  </Field>
                  <Field label="Restrição alimentar">
                    {registration.foodRestriction
                      ? `Sim – ${registration.foodRestriction}`
                      : 'Não'}
                  </Field>
                  {!info.isAdult && (
                    <Field label="Vai embora sozinho">
                      {registration.releasedToGoAwayAlone
                        ? 'Sim'
                        : `Não – busca: ${registration.pickupAuthorizedBy ?? '-'}`}
                    </Field>
                  )}
                  <Field label="Batismo">
                    {yesNo(registration.hasReceivedBaptism)}
                  </Field>
                  {info.asksEucharist && (
                    <Field label="1ª Eucaristia">
                      {yesNo(registration.hasReceivedEucharist)}
                    </Field>
                  )}
                  <Field label="Camiseta">{registration.shirtSize}</Field>
                  <Field label="Termo de compromisso">
                    Aceito em {formatTimestamp(registration.termsAcceptedAt)}
                  </Field>
                  {info.isAdult && (
                    <>
                      <Field label="Estado civil">
                        {registration.maritalStatus}
                      </Field>
                      <Field label="Mora junto">
                        {yesNo(registration.livesWithPartner)}
                      </Field>
                    </>
                  )}
                </dl>
              </fieldset>

              <fieldset className={fieldsetClassName}>
                <legend className={legendClassName}>
                  {info.isAdult ? 'Contato' : 'Responsáveis'}
                </legend>
                <ul className="flex flex-col gap-1.5 text-sm text-bunker-900">
                  {registration.parents.map((parent) => (
                    <li key={`${parent.name}-${parent.kinship}`}>
                      <span className="font-medium">{parent.name}</span>
                      <span className="text-bunker-500">
                        {' '}
                        · {parent.kinship}
                        {parent.phone && ` · ${maskPhone(parent.phone)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <fieldset className={fieldsetClassName}>
                <legend className={legendClassName}>Documentos</legend>
                <RegistrationDocuments registration={registration} />
              </fieldset>

              {registration.status === 'APPROVED' && (
                <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                  Aprovada por {registration.reviewedByName ?? 'a coordenação'}{' '}
                  em {formatTimestamp(registration.reviewedAt)}
                  {approvedClassroom &&
                    ` · turma ${approvedClassroom.name ?? approvedClassroom.location}`}
                  .
                </p>
              )}
              {registration.status === 'REJECTED' && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  Recusada por {registration.reviewedByName ?? 'a coordenação'}{' '}
                  em {formatTimestamp(registration.reviewedAt)}. Motivo:{' '}
                  {registration.rejectionReason}
                </p>
              )}

              {isPending && !isRejecting && (
                <fieldset className={fieldsetClassName}>
                  <legend className={legendClassName}>Aprovar</legend>
                  <Select
                    label="Turma"
                    description={`Turmas de ${info.classroomSegments.join(' e ')}`}
                    classNames={{
                      listbox: 'text-bunker-800',
                      selectorIcon: 'text-bunker-500',
                    }}
                    selectedKeys={classroomId ? [classroomId] : []}
                    onChange={(event) => setClassroomId(event.target.value)}
                    isDisabled={!options.length}
                  >
                    {options.map((item) => (
                      <SelectItem key={item.id!}>
                        {item.name ?? item.location}
                      </SelectItem>
                    ))}
                  </Select>
                  {!options.length && (
                    <p className="text-sm text-amber-700">
                      Não há turma ativa desta etapa. Cadastre uma turma antes
                      de aprovar.
                    </p>
                  )}
                </fieldset>
              )}

              {isPending && isRejecting && (
                <fieldset className={fieldsetClassName}>
                  <legend className={legendClassName}>Recusar</legend>
                  <Textarea
                    label="O que precisa ser corrigido?"
                    description="A família recebe este motivo no WhatsApp e pode enviar a inscrição de novo."
                    minRows={2}
                    maxLength={300}
                    value={reason}
                    onValueChange={setReason}
                  />
                </fieldset>
              )}

              {error && <p className="text-sm text-danger">{error}</p>}
            </>
          )}
        </ModalBody>

        <ModalFooter className="flex-wrap justify-between">
          {result ? (
            <Button variant="light" className="ml-auto" onPress={onClose}>
              Concluir
            </Button>
          ) : (
            <>
              <div className="flex flex-wrap items-start gap-2">
                <Button
                  variant="flat"
                  startContent={<FilePdf size={18} />}
                  onPress={() => downloadRegistrationPdf(registration)}
                >
                  Ficha em PDF
                </Button>
                <PackageMenu
                  onDownload={(format) =>
                    downloadRegistrationPackage(registration, format)
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="light" onPress={onClose}>
                  Fechar
                </Button>
                {isPending && !isRejecting && (
                  <>
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        setError('')
                        setIsRejecting(true)
                      }}
                    >
                      Recusar
                    </Button>
                    <Button
                      color="primary"
                      isDisabled={!classroomId}
                      isLoading={isSaving}
                      onPress={approve}
                    >
                      Aprovar e colocar na turma
                    </Button>
                  </>
                )}
                {isPending && isRejecting && (
                  <>
                    <Button
                      variant="light"
                      onPress={() => {
                        setError('')
                        setIsRejecting(false)
                      }}
                    >
                      Voltar
                    </Button>
                    <Button
                      color="danger"
                      isLoading={isSaving}
                      onPress={reject}
                    >
                      Confirmar recusa
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
