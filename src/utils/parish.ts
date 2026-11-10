// Identidade da paróquia nos documentos (PDFs e planilhas). Fica num lugar só:
// quando o sistema atender várias paróquias, este é o ponto que passa a vir da API
const PARISH = {
  archdiocese: 'ARQUIDIOCESE DE BRASÍLIA',
  name: 'PARÓQUIA NOSSA SENHORA APARECIDA – GAMA / DF',
}

// Linhas do cabeçalho de todo documento, em maiúsculas
export function parishHeaderLines(): string[] {
  return [PARISH.archdiocese, PARISH.name]
}
