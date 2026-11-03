import { classroom, parent } from '@/Types'
import { maskPhone } from '@/utils/phone'
import {
  inviteMessage,
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
} from '@nextui-org/react'
import {
  CheckCircle,
  PaperPlaneTilt,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface InviteParentsModalProps {
  classroom: classroom
  isOpen: boolean
  onClose: () => void
  // Só o coordenador cadastra o link
  onEditLink?: () => void
}

interface invite {
  // Telefone no formato do WhatsApp; identifica o convite
  key: string
  parent: parent
  catechizingNames: string[]
  number: string | null
}

// Primeira versão: quem já recebeu fica guardado só neste navegador
function storageKey(classroomId: string) {
  return `whatsapp-invites:${classroomId}`
}

function readSent(classroomId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(classroomId)) ?? '[]')
  } catch {
    return []
  }
}

function saveSent(classroomId: string, sent: string[]) {
  try {
    localStorage.setItem(storageKey(classroomId), JSON.stringify(sent))
  } catch {
    // Sem armazenamento (aba anônima, por exemplo): só não lembra
  }
}

export function InviteParentsModal({
  classroom,
  isOpen,
  onClose,
  onEditLink,
}: InviteParentsModalProps) {
  const [sent, setSent] = useState<string[]>([])

  useEffect(() => {
    if (isOpen && classroom.id) {
      setSent(readSent(classroom.id))
    }
  }, [isOpen, classroom.id])

  // Cada responsável recebe o seu convite; o mesmo telefone em mais de um
  // catequizando (irmãos, por exemplo) vira um convite só
  const invites: invite[] = []
  for (const catechizing of classroom.catechizings ?? []) {
    for (const parent of catechizing.parents) {
      const number = toWhatsappNumber(parent.phone)
      const sameNumber = number && invites.find((i) => i.number === number)
      if (sameNumber) {
        sameNumber.catechizingNames.push(catechizing.name)
        continue
      }
      invites.push({
        key: number ?? `sem-telefone:${parent.id}`,
        parent,
        catechizingNames: [catechizing.name],
        number,
      })
    }
  }
  const reachable = invites.filter((invite) => invite.number)
  const pending = reachable.filter((invite) => !sent.includes(invite.key))

  function markAsSent(key: string) {
    const next = Array.from(new Set([...sent, key]))
    setSent(next)
    saveSent(classroom.id!, next)
  }

  function sendInvite(invite: invite) {
    const message = inviteMessage(
      invite.parent,
      invite.catechizingNames.join(' e '),
      classroom,
    )
    window.open(whatsappChatUrl(invite.number!, message), '_blank', 'noopener')
    markAsSent(invite.key)
  }

  function resetSent() {
    setSent([])
    saveSent(classroom.id!, [])
  }

  const hasLink = Boolean(classroom.whatsappGroupLink)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="top"
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-bunker-900">
          <span className="text-xl font-semibold">Convidar responsáveis</span>
          <span className="text-sm font-normal text-bunker-500">
            {sent.filter((id) => reachable.some((i) => i.key === id)).length} de{' '}
            {reachable.length} convites enviados
            {invites.length > reachable.length &&
              ` · ${invites.length - reachable.length} sem telefone válido`}
          </span>
        </ModalHeader>
        <ModalBody>
          {!hasLink ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p>
                Esta turma ainda não tem o link do grupo do WhatsApp. No grupo,
                toque no nome → Convidar via link → Copiar link, e cadastre na
                turma.
              </p>
              {onEditLink ? (
                <Button size="sm" color="primary" onPress={onEditLink}>
                  Cadastrar link
                </Button>
              ) : (
                <p className="font-medium">
                  Peça para a coordenação cadastrar.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 rounded-xl bg-bunker-50 p-3 text-sm text-bunker-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Cada envio abre o WhatsApp com a mensagem pronta; é só apertar
                  enviar e voltar aqui.
                </span>
                <Button
                  color="primary"
                  className="shrink-0"
                  startContent={<PaperPlaneTilt size={18} />}
                  isDisabled={!pending.length}
                  onPress={() => sendInvite(pending[0])}
                >
                  {pending.length
                    ? `Enviar para o próximo (${pending.length})`
                    : 'Todos enviados'}
                </Button>
              </div>
              <ul className="flex flex-col divide-y divide-bunker-100">
                {invites.map((invite) => {
                  const isSent = sent.includes(invite.key)
                  const isNext = pending[0]?.key === invite.key
                  return (
                    <li
                      key={invite.key}
                      className={`flex items-center justify-between gap-3 px-1 py-2.5 ${isNext ? 'rounded-lg bg-bunker-50' : ''}`}
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-bunker-900">
                          {invite.parent.name}
                          {invite.parent.kinship && (
                            <span className="font-normal text-bunker-500">
                              {' '}
                              · {invite.parent.kinship}
                            </span>
                          )}
                        </span>
                        <span className="truncate text-xs text-bunker-500">
                          de {invite.catechizingNames.join(' e ')} ·{' '}
                          {maskPhone(invite.parent.phone) || 'sem telefone'}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isSent && (
                          <Chip
                            size="sm"
                            variant="flat"
                            startContent={<CheckCircle size={14} />}
                            classNames={{
                              base: 'bg-emerald-50 text-emerald-700',
                            }}
                          >
                            Enviado
                          </Chip>
                        )}
                        <Button
                          size="sm"
                          variant={isSent ? 'light' : 'flat'}
                          startContent={<WhatsappLogo size={16} />}
                          isDisabled={!invite.number}
                          onPress={() => sendInvite(invite)}
                          className={
                            isSent
                              ? 'text-bunker-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }
                        >
                          {!invite.number
                            ? 'Sem telefone'
                            : isSent
                              ? 'Reenviar'
                              : 'Enviar convite'}
                        </Button>
                      </div>
                    </li>
                  )
                })}
                {!invites.length && (
                  <li className="py-4 text-sm text-bunker-500">
                    Nenhum responsável cadastrado nesta turma.
                  </li>
                )}
              </ul>
            </>
          )}
        </ModalBody>
        <ModalFooter className="justify-between">
          <Button
            variant="light"
            size="sm"
            onPress={resetSent}
            isDisabled={!sent.length}
          >
            Limpar marcações
          </Button>
          <Button variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
