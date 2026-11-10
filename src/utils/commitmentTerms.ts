// Termo de compromisso da inscrição. Cada paróquia escreve o seu: parágrafos
// separados por linha em branco, com {signer} (quem assina) e {role} (o vínculo:
// "catequizando(a) adulto(a)," ou "responsável por Ana,") no lugar certo.
// Sem texto da paróquia, vale este, genérico.
export const DEFAULT_COMMITMENT_TERMS = `Estou ciente das normas da catequese desta paróquia e me comprometo com a presença nos encontros e com a participação nas atividades.

Eu, {signer}, {role} declaro que concordo com o termo acima.`

export function termParagraphs(template?: string | null): string[] {
  return (template?.trim() || DEFAULT_COMMITMENT_TERMS)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

// O vínculo de quem assina, já com a vírgula que fecha a oração
export function termRoleText(isAdult: boolean, catechizingName: string) {
  return isAdult
    ? 'catequizando(a) adulto(a),'
    : `responsável por ${catechizingName || '______________'},`
}

export type TermPart =
  | { type: 'text'; value: string }
  | { type: 'signer' }
  | { type: 'role' }

// Quebra o parágrafo nos marcadores, para a tela destacar o que é preenchido
export function splitTermParagraph(paragraph: string): TermPart[] {
  return paragraph
    .split(/(\{signer\}|\{role\})/)
    .filter(Boolean)
    .map((piece) =>
      piece === '{signer}'
        ? { type: 'signer' }
        : piece === '{role}'
          ? { type: 'role' }
          : { type: 'text', value: piece },
    )
}

// Parágrafo em texto puro (ficha impressa)
export function fillTermPlain(
  paragraph: string,
  signer: string,
  roleText: string,
) {
  return paragraph
    .replace(/\{signer\}/g, signer || '______________')
    .replace(/\{role\}/g, roleText)
}
