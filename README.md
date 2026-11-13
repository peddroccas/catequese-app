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

- `VITE_APP_NAME` (opcional, padrão `Catequese`): nome do produto no menu e na aba do navegador.
- `VITE_SITE_URL` (recomendado em produção): endereço público do app, sem barra no fim. Entra
  na prévia de link (`og:image`); sem ele, WhatsApp e redes podem não mostrar a imagem.
- `VITE_DEFAULT_PARISH_SLUG` (opcional, padrão `aparecida-gama`): para onde vai o endereço antigo `/inscricao`, sem a paróquia.
- `VITE_PASSWORD_RESET_EMAIL` (opcional, padrão desligado): com `true`, "Esqueci minha senha" pede o e-mail e a API manda o link. Desligada, a tela manda pedir a senha temporária à coordenação (a API precisa de e-mail configurado para ligar).
- `VITE_API_URL`: endereço da API. É lida no **build**, então trocar exige novo deploy.
  A API só aceita chamadas dos endereços listados em `CORS_ORIGINS` (veja o README da API):
  ao publicar o app em um endereço novo, inclua-o lá.

## Várias paróquias

O app atende várias paróquias. Quem entra vê só a paróquia dele: nome, diocese, cidade,
DDD, contatos da coordenação, valor do carnê, taxa de inscrição e termo de compromisso vêm
da API (tela **Configurações**, só coordenação). O cabeçalho dos PDFs e planilhas, o DDD dos
telefones e o termo da ficha impressa usam esses dados (`src/utils/parish.ts`).

A inscrição pública fica em `/inscricao/<slug-da-paróquia>`. O endereço antigo
`/inscricao` (sem slug) redireciona para a paróquia padrão.

## Administração do sistema (`/admin`)

Login próprio, separado dos catequistas (`/admin/login`). Lista as paróquias com totais,
cria paróquia + primeiro coordenador, suspende/reativa, define plano, vencimento e domínio
próprio, redefine a senha do coordenador, exporta e apaga os dados da paróquia. O usuário
administrador é criado na API com `npm run admin:create` (veja o README do `catequese-nest`).

Outro fluxo: `/esqueci-senha` e `/redefinir-senha?token=` (recuperação por e-mail; o link no login só
aparece com `VITE_PASSWORD_RESET_EMAIL=true`).

Em endereço de paróquia (domínio próprio ou subdomínio) o app descobre a paróquia por
`GET /public/parishes/resolve?host=` (`src/utils/hostParish.ts`); `/inscricao` leva à dela e o
login só aceita contas dela. Em `localhost` e `*.vercel.app` não há essa consulta.

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
