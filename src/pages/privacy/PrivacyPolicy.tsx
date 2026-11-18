import { BrandLogo } from '@/components/BrandLogo'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PrivacyPolicyContent } from './PrivacyPolicyContent'

export function PrivacyPolicy() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Política de Privacidade · Catequese Hub'
    window.scrollTo({ top: 0 })
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="min-h-screen bg-creme-100">
      <header className="flex min-h-[4.5rem] items-center border-b border-creme-200 bg-white px-4 py-3 sm:px-8">
        <Link to="/login" aria-label="Ir para o Catequese Hub">
          <BrandLogo />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <article className="rounded-2xl border border-bunker-200/70 bg-white px-5 py-7 text-sm leading-relaxed text-bunker-700 sm:px-10 sm:py-10 sm:text-base">
          <h1 className="text-3xl font-semibold tracking-tight text-bunker-900 sm:text-4xl">
            Política de Privacidade do Catequese Hub
          </h1>
          <div className="mt-4 space-y-4 [&_a]:break-words [&_a]:font-medium [&_a]:text-bunker-900 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-bunker-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            <PrivacyPolicyContent />
          </div>
        </article>
      </main>
    </div>
  )
}
