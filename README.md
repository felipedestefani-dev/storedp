# Lições e trabalhos (site estático)

Organize lições e trabalhos no navegador: **login com e-mail e senha** (Supabase), **adicionar**, **remover**, **marcar feito**, filtros e data de entrega opcional.

Não usa Node nem Next.js: abra com o **Live Server** (ou qualquer servidor estático).

## Configurar

1. Copie `config.example.js` para `config.js` na mesma pasta.
2. No [Supabase](https://supabase.com) → **Project Settings → API**, cole a chave **anon public** em `SUPABASE_ANON_KEY` dentro de `config.js` (a URL de exemplo já está em `config.example.js`).

O arquivo `config.js` está no `.gitignore` e **não deve** ser commitado.

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
