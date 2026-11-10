# catequese-app

Front do sistema de catequese (React 18, Vite, TypeScript, NextUI e Tailwind). Fala com a API `catequese-nest`.

## Rodar localmente

Precisa de Node 20+ e da API rodando (veja o README do `catequese-nest`).

```bash
npm install
cp .env.example .env     # VITE_API_URL aponta para a API
npm run dev              # http://localhost:5173
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run lint` | ESLint (sem avisos permitidos) |
| `npm run build` | confere os tipos (`tsc -b`) e gera `dist/` |
| `npm run preview` | serve o `dist/` gerado |

## Variáveis de ambiente

- `VITE_API_URL`: endereço da API. É lida no **build**, então trocar exige novo deploy.
  A API só aceita chamadas dos endereços listados em `CORS_ORIGINS` (veja o README da API):
  ao publicar o app em um endereço novo, inclua-o lá.

## Deploy

Vercel, projeto estático. O `vercel.json` reescreve todas as rotas para `/` (SPA).

## Estrutura

```
src/pages/<feature>   telas, cada uma com seus components/
src/components        componentes compartilhados
src/contexts          AuthContext e ClassroomContext (listas carregadas após o login)
src/services          cliente da API (api.ts) e repositórios por área
src/utils             PDFs, planilhas, validações, telefone, datas
```

## Perfis

- **Coordenador**: vê e altera tudo (turmas, catequistas, finanças, inscrições, arquivo).
- **Catequista**: vê só as próprias turmas e catequizandos, registra chamada e carnê delas.
  A API é quem garante isso; esconder botões na tela é só conveniência.
