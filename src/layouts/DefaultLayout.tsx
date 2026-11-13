import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageFallback } from '../components/PageFallback'
import { Header } from '../components/Header'
import { ParishBar } from '../components/ParishBar'

export function DefaultLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-creme-100">
      <Header />
      <ParishBar />
      <div className="mx-auto flex w-full max-w-screen-2xl flex-grow flex-col px-4 py-6 sm:px-8 sm:py-8">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
