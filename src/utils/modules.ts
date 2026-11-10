import { parishModule } from '@/Types'

// As abas que o administrador pode desligar por paróquia e os caminhos de cada uma.
// Início, turmas, catequizandos e catequistas ficam sempre ligados
export const parishModules: {
  key: parishModule
  label: string
  paths: string[]
}[] = [
  { key: 'finances', label: 'Finanças e carnê', paths: ['/finances'] },
  { key: 'registrations', label: 'Inscrições', paths: ['/inscricoes'] },
  {
    key: 'meetings',
    label: 'Chamadas',
    paths: ['/meetings', '/meeting-themes'],
  },
  { key: 'formations', label: 'Formações', paths: ['/formations'] },
  { key: 'rites', label: 'Ritos', paths: ['/rites'] },
  { key: 'archive', label: 'Arquivo', paths: ['/archive'] },
]

type WithModules = { disabledModules?: parishModule[] } | null | undefined

// Qual aba é dona do caminho (undefined = não é uma aba que se possa desligar)
export function moduleOfPath(pathname: string): parishModule | undefined {
  return parishModules.find((item) => item.paths.includes(pathname))?.key
}

export function isModuleEnabled(parish: WithModules, key: parishModule) {
  return !(parish?.disabledModules ?? []).includes(key)
}

// false só se o caminho for de uma aba desligada para a paróquia
export function isPathEnabled(pathname: string, parish: WithModules) {
  const key = moduleOfPath(pathname)

  return !key || isModuleEnabled(parish, key)
}
