import catequeseLogo from '../assets/catequese-logo.png'

export function Header() {
  return (
    <header className="flex w-full justify-between bg-gradient-to-r from-blue-900 via-blue-950 to-blue-950 p-1">
      <p />
      <img className="w-28 rounded-full" src={catequeseLogo} alt="" />
    </header>
  )
}
