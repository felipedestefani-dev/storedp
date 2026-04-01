# Lições e trabalhos (site estático)

Organize lições e trabalhos no navegador: **login com e-mail e senha** (Supabase), **adicionar**, **remover**, **marcar feito**, filtros e data de entrega opcional.

Não usa Node nem Next.js: abra com o **Live Server** (ou qualquer servidor estático).

## Configurar

O projeto usa **`config.js`** com a URL do projeto e a chave **anon** do Supabase. A chave anon **não é segredo** no front-end (o Supabase foi feito para isso; o que protege os dados é o **RLS** no banco). Ela aparece no navegador de qualquer forma — por isso o `config.js` **pode** ir no Git e no deploy estático.

1. Se for clonar o repositório do zero: copie `config.example.js` para `config.js` e preencha URL + anon em **Project Settings → API**.
2. **Publicar no GitHub Pages / hospedagem estática**: o `config.js` precisa estar no repositório (ou gerado no build), senão o site mostra a tela “Configuração”.

**Nunca** coloque a chave **service_role** no repositório nem em JS público.

## Banco de dados

No **SQL Editor** do Supabase, execute [`supabase/migrations/001_assignments.sql`](supabase/migrations/001_assignments.sql) (tabela `assignments` + RLS).

## Autenticação (Supabase)

Em **Authentication → URL Configuration**:

- **Site URL**: a URL base que você usa no Live Server (ex.: `http://127.0.0.1:5500`).
- **Redirect URLs**: inclua `http://127.0.0.1:5500/auth-callback.html` e `http://localhost:5500/auth-callback.html` (ajuste a porta se o Live Server usar outra).

Para cadastro sem confirmar e-mail em testes: **Authentication → Providers → Email** → desative **Confirm email** (só em desenvolvimento).

## Como abrir com o Live Server

1. No VS Code / Cursor, abra a pasta deste projeto.
2. Clique com o botão direito em `index.html` → **Open with Live Server** (extensão “Live Server”).
3. O site abre no navegador (geralmente porta **5500**).

Se aparecer só pastas, confira se abriu a pasta certa e se existe `index.html` na raiz.

## Arquivos principais

| Arquivo | Função |
| --- | --- |
| `index.html` | Página única (landing, login, painel) |
| `style.css` | Estilos |
| `app.js` | Lógica e Supabase |
| `auth-callback.html` | Volta do link de confirmação de e-mail |
| `config.js` | URL e chave anon (você cria a partir do exemplo) |

O `app.js` carrega o cliente Supabase via CDN (`esm.sh`); é preciso **internet** na primeira carga.

## Deploy estático

Qualquer hospedagem de arquivos estáticos (Netlify, GitHub Pages, Cloudflare Pages) funciona: envie `index.html`, `style.css`, `app.js`, `auth-callback.html` e configure `config.js` nas variáveis do host **ou** gere `config.js` no build. Cadastre a URL de produção em **Redirect URLs** no Supabase.
