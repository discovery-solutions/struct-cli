# discovery-solutions/struct-cli (CLI)

CLI para inicializar projetos e gerar entidades para o boilerplate DSCVR Struct.

## Instalação
npx (recomendado):
npx github:discovery-solutions/struct-cli@latest init

ou local:
pnpm install
pnpm build
node dist/index.js --help

## Comandos

- struct init
  - Clona o boilerplate oficial e personaliza o nome do projeto.
  - Opções:
    - --name <projectName>
    - --branch <branch> (default: main)

- struct generate --doc <file.md|json>
  - Extrai entidades do documento usando OpenAI e gera:
    - models (index.ts, model.tsx, utils.tsx)
    - API CRUD (route.ts)
    - UI (página de lista) — pode desabilitar com --no-ui
    - Atualiza o menu em src/components/nav/items.tsx
  - Opções:
    - --domain <domain> (default: content)
    - --no-ui
    - --yes (não perguntar confirmação)

## Requisitos
- Defina OPENAI_API_KEY no ambiente antes de rodar `generate`.
- Projeto alvo deve ser o boilerplate DSCVR Struct (ou compatível).

## Exemplo
struct init --name my-app
cd my-app
cp .env.example .env.local
pnpm install

# Configure OPENAI_API_KEY no .env.local
struct generate --doc ./postcraft.md --domain content