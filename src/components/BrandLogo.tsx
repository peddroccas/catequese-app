import fullLogo from '@/assets/catequese-hub-logo-tela-claro.svg'
import nameLogo from '@/assets/catequese-hub-nome-claro.svg'
import { APP_NAME } from '@/lib/config'

interface BrandLogoProps {
  alt?: string
  title?: string
}

// Logo do cabeçalho (Figma › Branding › 08). No celular vai só o nome, maior,
// para dar para ler; a partir do tablet, símbolo + nome. shrink-0 e max-w-none
// evitam que o cabeçalho espreme a imagem (o texto ficava minúsculo)
export function BrandLogo({ alt = APP_NAME, title }: BrandLogoProps) {
  return (
    <>
      <img
        className="h-10 w-auto max-w-none shrink-0 sm:hidden"
        src={nameLogo}
        alt={alt}
        title={title}
      />
      <img
        className="hidden h-10 w-auto max-w-none shrink-0 sm:block"
        src={fullLogo}
        alt={alt}
        title={title}
      />
    </>
  )
}
