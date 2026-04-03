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

- **Site URL**: a URL base que você usa (ex.: `http://127.0.0.1:5500` com Live Server).
- **Redirect URLs**: inclua  
  `http://127.0.0.1:5500/auth-callback.html`  
  `http://localhost:5500/auth-callback.html`  
  e a URL do site em produção, se houver.

## Arquivos principais

| Arquivo | Função |
| --- | --- |
| `index.html` | Login + painel |
| `style.css` | Estilos |
| `app.js` | Supabase + lógica |
| `auth-callback.html` | Retorno do e-mail de confirmação (mesma URL/chave que `app.js`) |

O `app.js` carrega o cliente Supabase via `esm.sh`; é preciso **internet** na primeira carga.
