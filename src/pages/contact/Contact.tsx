import { BrandLogo } from '@/components/BrandLogo'
import { PrivacyPolicyLink } from '@/components/PrivacyPolicyLink'
import { useAuth } from '@/hooks/useAuth'
import { useParish } from '@/hooks/useParish'
import { toast } from '@/lib/toast'
import { getErrorMessage } from '@/services/api'
import { supportRepository } from '@/services/repositories/supportRepository'
import { Button, Input, Textarea } from '@nextui-org/react'
import {
  CheckCircle,
  EnvelopeSimple,
  Paperclip,
  X,
} from '@phosphor-icons/react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const fieldClass = 'flex flex-col gap-2 text-sm font-medium text-bunker-800'
export function Contact() {
  const { user } = useAuth()
  const { parish } = useParish()
  const location = useLocation()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [category, setCategory] = useState('BUG')
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([])
  const [sending, setSending] = useState(false)
  const [protocol, setProtocol] = useState('')
  const [supportEmail, setSupportEmail] = useState(
    'contato@catequesehub.com.br',
  )
  const [error, setError] = useState('')
  const id = useRef(crypto.randomUUID())
  const busy = useRef(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const dirty = useRef(false)
  useEffect(() => {
    supportRepository
      .config()
      .then((config) => setSupportEmail(config.email))
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (!dirty.current && user) {
      setName(user.name)
      setEmail(user.email ?? '')
    }
  }, [user])
  useEffect(() => {
    const next = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setPreviews(next)
    return () => next.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [files])
  function changed() {
    dirty.current = true
    id.current = crypto.randomUUID()
    setError('')
  }
  function addFiles(selected: FileList | null) {
    const next = [...files, ...Array.from(selected ?? [])]
    if (
      next.length > 3 ||
      next.some(
        (file) =>
          file.size > 5 * 1024 * 1024 ||
          !['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      )
    ) {
      toast.error('Envie até 3 imagens PNG, JPEG ou WebP de até 5 MB cada.')
      return
    }
    changed()
    setFiles(next)
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy.current) return
    busy.current = true
    setSending(true)
    setError('')
    try {
      const data = new FormData()
      const sourcePath: unknown = location.state?.sourcePath
      const source = new URL(
        typeof sourcePath === 'string' &&
        sourcePath.startsWith('/') &&
        !sourcePath.startsWith('//')
          ? sourcePath
          : '/contato',
        window.location.origin,
      )
      source.search = ''
      source.hash = ''
      Object.entries({
        submissionId: id.current,
        name: name.trim(),
        email: email.trim(),
        category,
        subject: subject.trim(),
        text: text.trim(),
        sourceUrl: source.toString(),
        parishName: parish?.name ?? '',
        website: honeypot.current?.value ?? '',
      }).forEach(([key, value]) => data.set(key, value))
      files.forEach((file) => data.append('images', file))
      const result = await supportRepository.submit(data)
      setProtocol(result.protocol)
      setFiles([])
    } catch (failure) {
      setError(getErrorMessage(failure))
    } finally {
      busy.current = false
      setSending(false)
    }
  }
  return (
    <div className="flex min-h-screen flex-col bg-creme-100">
      <header className="flex min-h-[4.5rem] flex-wrap items-center justify-between gap-3 border-b border-creme-200 bg-white px-4 py-3 sm:px-8">
        <Link to={user ? '/inicio' : '/login'} aria-label="Voltar ao sistema">
          <BrandLogo />
        </Link>
        <Link
          to={user ? '/inicio' : '/login'}
          className="text-sm text-bunker-700 underline"
        >
          {user ? 'Voltar ao sistema' : 'Entrar no sistema'}
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
        <div>
          <span className="text-sm font-medium text-ouro-700">
            SUPORTE DO CATEQUESE HUB
          </span>
          <h1 className="mt-2 text-3xl font-semibold text-bunker-900">
            Fale conosco
          </h1>
          <p className="mt-3 text-base leading-relaxed text-bunker-600">
            Encontrou um problema, tem uma dúvida ou quer sugerir uma melhoria?
            Conte para nós. Responderemos pelo e-mail informado.
          </p>
        </div>
        {protocol ? (
          <section
            role="status"
            className="flex flex-col gap-4 rounded-2xl border border-verde-100 bg-white p-6"
          >
            <CheckCircle size={40} className="text-verde-700" />
            <h2 className="text-xl font-semibold">Mensagem recebida!</h2>
            <p>
              Seu protocolo é <strong>{protocol}</strong>. Guarde esse número
              para identificar seu contato.
            </p>
            <p className="text-bunker-600">
              Se precisarmos de mais informações, entraremos em contato pelo
              e-mail <strong className="break-all">{email}</strong>.
            </p>
            <Button
              className="self-start"
              variant="bordered"
              onPress={() => {
                setProtocol('')
                setSubject('')
                setText('')
                changed()
              }}
            >
              Enviar outra mensagem
            </Button>
          </section>
        ) : (
          <form
            onSubmit={submit}
            className="flex flex-col gap-5 rounded-2xl border border-bunker-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <fieldset disabled={sending} className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Seu nome"
                  value={name}
                  onValueChange={(v) => {
                    changed()
                    setName(v)
                  }}
                  autoComplete="name"
                  isRequired
                  minLength={2}
                  maxLength={120}
                  variant="bordered"
                />
                <Input
                  label="E-mail para resposta"
                  type="email"
                  value={email}
                  onValueChange={(v) => {
                    changed()
                    setEmail(v)
                  }}
                  autoComplete="email"
                  isRequired
                  maxLength={254}
                  variant="bordered"
                />
              </div>
              <label className={fieldClass}>
                Tipo de contato
                <select
                  value={category}
                  onChange={(e) => {
                    changed()
                    setCategory(e.target.value)
                  }}
                  className="rounded-xl border border-bunker-300 bg-white p-3 text-base"
                >
                  <option value="BUG">Relatar um problema</option>
                  <option value="QUESTION">Tirar uma dúvida</option>
                  <option value="SUGGESTION">Sugerir uma melhoria</option>
                </select>
              </label>
              <Input
                label="Assunto"
                value={subject}
                onValueChange={(v) => {
                  changed()
                  setSubject(v)
                }}
                isRequired
                minLength={3}
                maxLength={160}
                variant="bordered"
              />
              <Textarea
                label="Sua mensagem"
                description="Para relatar um problema, diga em qual tela aconteceu, o que tentou fazer e o que apareceu."
                value={text}
                onValueChange={(v) => {
                  changed()
                  setText(v)
                }}
                isRequired
                minLength={10}
                maxLength={10000}
                minRows={6}
                variant="bordered"
              />
              <div className="flex flex-col gap-3">
                <label className={fieldClass}>
                  <span className="flex items-center gap-2">
                    <Paperclip size={20} /> Capturas de tela (opcional)
                  </span>
                  <span className="font-normal text-bunker-500">
                    Até 3 imagens PNG, JPEG ou WebP, com até 5 MB cada.
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      addFiles(e.target.files)
                      e.target.value = ''
                    }}
                    className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-bunker-100 file:px-4 file:py-2 file:text-bunker-800"
                  />
                </label>
                {!!previews.length && (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previews.map((preview, i) => (
                      <li
                        className="relative min-w-0 rounded-xl border border-bunker-200 p-2"
                        key={preview.url}
                      >
                        <img
                          src={preview.url}
                          alt={`Imagem selecionada: ${preview.name}`}
                          className="h-28 w-full rounded-lg object-contain"
                        />
                        <p className="truncate pt-2 text-xs">{preview.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            changed()
                            setFiles(files.filter((_, index) => index !== i))
                          }}
                          aria-label={`Remover imagem ${i + 1}`}
                          className="absolute right-1 top-1 rounded-full border bg-white p-1"
                        >
                          <X size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <label aria-hidden="true" className="absolute -left-[10000px]">
                Website
                <input
                  ref={honeypot}
                  tabIndex={-1}
                  autoComplete="off"
                  name="website"
                />
              </label>
              <p className="text-sm leading-relaxed text-bunker-500">
                Envie apenas as informações necessárias. Evite incluir senhas ou
                documentos pessoais nas imagens.
              </p>
            </fieldset>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-danger-50 p-3 text-sm text-danger-700"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={sending}
              className="self-start px-8"
            >
              Enviar mensagem
            </Button>
          </form>
        )}
        <p className="flex flex-wrap items-center gap-2 text-sm text-bunker-600">
          <EnvelopeSimple size={20} /> Prefere enviar por e-mail?{' '}
          <a
            href={`mailto:${supportEmail}`}
            className="break-all font-medium text-bunker-800 underline"
          >
            {supportEmail}
          </a>
        </p>
        <div>
          <PrivacyPolicyLink newTab />
        </div>
      </main>
    </div>
  )
}
