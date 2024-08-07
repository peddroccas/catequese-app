import catequeseLogo from '../assets/catequese-logo.png'

export function Header() {
  return (
    <header className="flex w-auto justify-between bg-gradient-to-r from-blue-950 via-blue-950 to-blue-900 p-1">
      <img className="w-28 rounded-full" src={catequeseLogo} alt="" />
      <p />
    </header>
  )
}
