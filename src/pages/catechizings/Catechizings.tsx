import { useState } from 'react'
import { AddNewCatechizingForm } from './components/AddNewCatechizingForm'

export function Catechizings() {
  useState<boolean>(false)
  return (
    <div className="mt-4 flex flex-grow flex-col items-center justify-start gap-8 pb-8 pt-4">
      <AddNewCatechizingForm />
    </div>
  )
}
