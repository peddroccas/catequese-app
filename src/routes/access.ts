// Caminhos que o catequista (perfil MEMBER) pode abrir. Os outros só a
// coordenação. A API é quem garante de verdade; isto só evita telas vazias.
// Catequizandos fica de fora: o catequista já os vê em "Minhas turmas"
export const memberPaths = [
  '/inicio',
  '/classroom',
  '/meetings',
  '/rites',
  '/finances',
  '/profile',
]
