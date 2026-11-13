import { BrandLogo } from '@/components/BrandLogo'
import { APP_NAME } from '@/lib/config'
import { publicParish, registrationSegment } from '@/Types'
import { ParishRepository } from '@/services/repositories/parishRepository'
import { RegistrationRepository } from '@/services/repositories/registrationRepository'
import { parishPlace, setCurrentParish } from '@/utils/parish'
import { registrationSegments } from '@/utils/registration'
import { registrationSegmentTone } from '@/utils/segmentTone'
import { paymentNoticePropsOf } from '@/utils/registrationPayment'
import { Button, CircularProgress } from '@nextui-org/react'
import {
  CheckCircle,
  LockSimple,
  MapPinLine,
  WarningCircle,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CoordinationContactsCard } from './components/CoordinationContactsCard'
import { RegistrationForm } from './components/RegistrationForm'
import { RegistrationPaymentNotice } from './components/RegistrationPaymentNotice'

type pageState = 'loading' | 'error' | 'notFound' | 'closed' | 'open'

const cardClassName =
  'rounded-2xl border border-bunker-200/70 bg-white p-6 shadow-lg shadow-bunker-900/5 sm:p-8'

// Formulário público de inscrição na catequese de uma paróquia (o endereço traz
// o slug: /inscricao/<paroquia>). Não precisa de login
export function Registration() {
  const { slug = '' } = useParams()
  const [state, setState] = useState<pageState>('loading')
  const [parish, setParish] = useState<publicParish | null>(null)
  const [segment, setSegment] = useState<registrationSegment | null>(null)
  const [openSegments, setOpenSegments] = useState<registrationSegment[]>([])
  const [protocol, setProtocol] = useState<string | null>(null)

  function load() {
    setState('loading')
    Promise.all([
      ParishRepository.getPublic(slug),
      RegistrationRepository.getPublicStatus(slug),
    ])
      .then(([publicParish, settings]) => {
        setParish(publicParish)
        // Telefones e mensagens da página usam o DDD desta paróquia
        setCurrentParish(publicParish)
        document.title = `${publicParish.name} · ${APP_NAME}`
        setOpenSegments(settings.openSegments)
        setState(settings.isOpen ? 'open' : 'closed')
      })
      .catch((error) => {
        // Paróquia que não existe (ou suspensa) responde 404
        setState(error?.response?.status === 404 ? 'notFound' : 'error')
      })
  }

  useEffect(() => {
    load()
    return () => setCurrentParish(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function changeStep(next: registrationSegment | null) {
    setSegment(next)
    window.scrollTo({ top: 0 })
  }

  function handleDone(code: string) {
    setProtocol(code)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="flex min-h-screen flex-col bg-creme-100">
      <header className="flex h-[4.5rem] items-center gap-3 border-b border-bunker-200/70 bg-white px-4 shadow-sm shadow-bunker-900/5 sm:px-8">
        {/* Paróquia com logo própria mostra a dela; sem logo, vai a do produto */}
        {parish?.logoUrl ? (
          <>
            <img className="w-11" src={parish.logoUrl} alt="" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-wide text-bunker-900">
                {APP_NAME}
              </span>
              <span className="text-xs text-bunker-500">
                {parish.name} · {parishPlace(parish)}
              </span>
            </div>
          </>
        ) : (
          <>
            <BrandLogo />
            {parish && (
              <span className="flex flex-col border-l border-bunker-200 pl-3 text-xs leading-tight text-bunker-500">
                <span>{parish.name}</span>
                <span className="text-bunker-400">{parishPlace(parish)}</span>
              </span>
            )}
          </>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
        {state === 'loading' && (
          <div className="flex flex-1 items-center justify-center">
            <CircularProgress aria-label="Carregando" />
          </div>
        )}

        {state === 'notFound' && (
          <div
            className={`${cardClassName} flex flex-col items-center gap-3 text-center`}
          >
            <MapPinLine size={40} className="text-bunker-500" />
            <h1 className="text-xl font-semibold text-bunker-900">
              Paróquia não encontrada
            </h1>
            <p className="text-sm text-bunker-500">
              Confira o endereço que você recebeu da paróquia. Se o problema
              continuar, fale com a coordenação.
            </p>
          </div>
        )}

        {state === 'error' && (
          <div
            className={`${cardClassName} flex flex-col items-center gap-3 text-center`}
          >
            <WarningCircle size={40} className="text-amber-500" />
            <h1 className="text-xl font-semibold text-bunker-900">
              Não foi possível carregar
            </h1>
            <p className="text-sm text-bunker-500">
              Verifique a internet e tente novamente.
            </p>
            <Button color="primary" onPress={load}>
              Tentar de novo
            </Button>
          </div>
        )}

        {state === 'closed' && !protocol && (
          <div
            className={`${cardClassName} flex flex-col items-center gap-3 text-center`}
          >
            <LockSimple size={40} className="text-bunker-500" />
            <h1 className="text-xl font-semibold text-bunker-900">
              Inscrições encerradas
            </h1>
            <p className="text-sm text-bunker-500">
              No momento não estamos recebendo inscrições para a catequese. Em
              caso de dúvida, fale com a coordenação.
            </p>
          </div>
        )}

        {state === 'closed' && !protocol && (
          <CoordinationContactsCard
            contacts={parish?.coordinationContacts ?? []}
          />
        )}

        {protocol && (
          <div
            className={`${cardClassName} flex flex-col items-center gap-3 text-center`}
          >
            <CheckCircle size={48} weight="fill" className="text-emerald-500" />
            <h1 className="text-xl font-semibold text-bunker-900">
              Inscrição enviada!
            </h1>
            <p className="text-sm text-bunker-600">
              A coordenação vai conferir os dados e os documentos e entrará em
              contato pelo WhatsApp informado.
            </p>
            <div className="rounded-xl bg-bunker-50 px-5 py-3">
              <p className="text-xs uppercase tracking-wide text-bunker-500">
                Código da inscrição
              </p>
              <p className="text-2xl font-semibold tracking-widest text-bunker-900">
                {protocol}
              </p>
            </div>
            <p className="text-xs text-bunker-500">
              Guarde este código: ele ajuda a coordenação a encontrar a sua
              inscrição.
            </p>
          </div>
        )}

        {protocol && (
          <>
            <RegistrationPaymentNotice
              {...paymentNoticePropsOf(parish)}
              protocol={protocol}
            />
            <CoordinationContactsCard
              contacts={parish?.coordinationContacts ?? []}
            />
          </>
        )}

        {state === 'open' && parish && !protocol && !segment && (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-bunker-900">
                Inscrição para a catequese
              </h1>
              <p className="text-sm text-bunker-500">
                Escolha a etapa. Vagas limitadas; só aceitamos inscrições com
                todos os documentos.
              </p>
            </div>
            <RegistrationPaymentNotice {...paymentNoticePropsOf(parish)} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {registrationSegments.map((item) => {
                const isSegmentOpen = openSegments.includes(item.key)

                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={!isSegmentOpen}
                    onClick={() => changeStep(item.key)}
                    className="flex flex-col gap-1 rounded-2xl border border-bunker-200/70 bg-white p-5 text-left shadow-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 enabled:hover:-translate-y-0.5 enabled:hover:border-bunker-300 enabled:hover:shadow-md disabled:cursor-not-allowed disabled:bg-bunker-100/60 disabled:shadow-none"
                  >
                    <span
                      className={`flex items-center gap-2 text-lg font-semibold ${isSegmentOpen ? 'text-bunker-900' : 'text-bunker-400'}`}
                    >
                      <span
                        aria-hidden
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${isSegmentOpen ? registrationSegmentTone(item.key).dot : 'bg-bunker-300'}`}
                      />
                      {item.title}
                    </span>
                    <span className="text-sm text-bunker-500">
                      {item.description}
                    </span>
                    {!isSegmentOpen && (
                      <span className="mt-1 text-xs font-medium text-bunker-500">
                        Inscrições encerradas para esta etapa
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <CoordinationContactsCard contacts={parish.coordinationContacts} />
          </>
        )}

        {state === 'open' && parish && !protocol && segment && (
          <div className={cardClassName}>
            <RegistrationForm
              key={segment}
              slug={slug}
              terms={parish.commitmentTerms}
              payment={paymentNoticePropsOf(parish)}
              contacts={parish.coordinationContacts}
              segment={segment}
              onBack={() => changeStep(null)}
              onDone={handleDone}
            />
          </div>
        )}
      </main>
    </div>
  )
}
