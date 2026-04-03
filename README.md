# Felipe Investments

Painel financeiro no navegador (ganhos, ganhos futuros, despesas, lucro, investimentos) com dados no **Supabase** e login por **e-mail e senha**.

Não usa Node: abra com **Live Server** ou publique como site estático.

**Tutorial passo a passo (URL, anon key, SQL, auth):** veja [`docs/tutorial-supabase.md`](docs/tutorial-supabase.md).

## 1. Projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie **Project URL** e a chave **anon** `public`.

## 2. Banco de dados

No **SQL Editor**, execute em ordem:

1. [`supabase/migrations/002_finance_entries.sql`](supabase/migrations/002_finance_entries.sql) — tabela `finance_entries` + RLS.
2. Se o projeto já existia só com `002`, rode também [`003_finance_entries_entry_date_text.sql`](supabase/migrations/003_finance_entries_entry_date_text.sql) — permite prazos em texto (ex.: “até 20/07”) no campo de data.

(O arquivo `001_assignments.sql` é legado; pode ignorar.)

## 3. Configuração no site

No início de **`app.js`**, preencha:

```js
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOi...'
```

Repita **os mesmos dois valores** no script de **`auth-callback.html`** (onde hoje estão strings vazias), para o link de confirmação de e-mail funcionar.

A chave **anon** não é segredo no front; a segurança vem do **RLS** no banco. **Nunca** coloque a chave `service_role` no repositório.

## 4. Autenticação (URLs)

Em **Authentication → URL Configuration**:

- **Site URL**: a URL “principal” do app (a mesma base onde está o `index.html`).
  - Local: `http://127.0.0.1:5500` (Live Server) ou equivalente.
  - **GitHub Pages** (projeto em subpasta): `https://SEU-USUARIO.github.io/NOME-DO-REPO/` — ex.: `https://felipedestefani-dev.github.io/storedp/`
- **Redirect URLs** (adicione **todas** as que for usar; uma por linha ou wildcard permitido pelo Supabase):
  - `http://127.0.0.1:5500/auth-callback.html`
  - `http://localhost:5500/auth-callback.html`
  - Em produção: `https://SEU-USUARIO.github.io/NOME-DO-REPO/auth-callback.html`  
    (ex.: `https://felipedestefani-dev.github.io/storedp/auth-callback.html`)

O `app.js` monta o link do callback com `new URL('auth-callback.html', location.href)`, então em GitHub Pages o caminho `/storedp/` já fica correto, desde que você abra o site por essa URL base.

## Arquivos principais

| Arquivo | Função |
| --- | --- |
| `index.html` | Login + painel |
| `style.css` | Estilos |
| `app.js` | Supabase + lógica |
| `auth-callback.html` | Retorno do e-mail de confirmação (mesma URL/chave que `app.js`) |

O `index.html` carrega o Supabase via CDN (jsdelivr); é preciso **internet** na primeira carga.

O `index.html` inclui um `<base>` definido por script para **GitHub Pages em subpasta** (`/storedp/`): sem isso, o navegador pode pedir `app.js` na raiz do domínio (`/app.js`) em vez de `/storedp/app.js`, o JS não carrega e **nenhum botão funciona**.

## Deploy (Netlify, Vercel, GitHub Pages, etc.)

É um **site estático** na **raiz** do repositório: não há bundler. O `package.json` existe só para o comando `npm run build` passar no CI (ele só confirma que `index.html`, `app.js`, etc. existem).

- **Netlify:** use o `netlify.toml` (publica `.` após `npm run build`).
- **Vercel:** Framework **Other**, ou deixe o `vercel.json` com `buildCommand` como está; **Root Directory** = repositório; não use uma pasta `dist` antiga de outro projeto como saída.
- **Publicar pasta errada:** se o painel apontar só para `dist/`, vai subir o app antigo (`storedp` / React). O site atual é **`index.html` na raiz**.

Configure **Site URL** e **Redirect URLs** no Supabase para a URL real do deploy (incluindo subpasta no GitHub Pages, se for o caso).
