import catequeseLogo from '../assets/catequese-logo.png'

export function Header() {
  return (
    <header className="flex w-auto justify-between bg-blue-950 p-1">
      <img className="w-28 rounded-full" src={catequeseLogo} alt="" />
      <p />
    </header>
  )
}
