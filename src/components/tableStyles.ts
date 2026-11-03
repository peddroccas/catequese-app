// Estilos compartilhados do tema claro

// Superfície branca padrão (cards, painéis, tabelas)
export const surfaceClassName =
  'rounded-2xl border border-bunker-200/70 bg-white shadow-sm'

// Tabela padrão, com a linha sombreada ao passar o mouse
// A partir de tablet a tabela ocupa no máximo a altura da tela e rola por
// dentro: a barra de rolagem horizontal fica sempre visível e o cabeçalho fica
// fixo (isHeaderSticky). No celular rola junto com a página.
export const tableClassNames = {
  base: 'max-w-full',
  wrapper: `${surfaceClassName} overflow-auto p-0 md:max-h-[calc(100dvh-9rem)]`,
  table: 'border-separate border-spacing-0',
  thead: '[&>tr]:first:shadow-[0_1px_0_0_#d1dae6]',
  th: 'bg-bunker-50 text-[11px] font-semibold uppercase tracking-wide text-bunker-500 first:rounded-none last:rounded-none',
  td: 'text-sm text-bunker-800',
  sortIcon: 'text-bunker-500',
  tr: 'border-b border-bunker-100 last:border-none transition-colors duration-150 hover:bg-bunker-50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg',
  emptyWrapper: 'text-bunker-400',
}

// Modais brancos com cabeçalho alinhado à esquerda
export const modalClassNames = {
  base: 'bg-white',
  header: 'flex flex-col gap-1 border-b border-bunker-100 text-bunker-900',
  body: 'py-5',
  footer: 'border-t border-bunker-100',
}

// Grupo de campos (responsáveis, adultos, chamada)
export const fieldsetClassName =
  'flex flex-col gap-3 rounded-xl border border-bunker-200 bg-bunker-50/60 p-4'

export const legendClassName =
  'px-1 text-xs font-semibold uppercase tracking-wide text-bunker-500'
