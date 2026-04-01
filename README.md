# Lições e trabalhos (site estático)

Organize lições e trabalhos no navegador: **login com e-mail e senha** (Supabase), **adicionar**, **remover**, **marcar feito**, filtros e data de entrega opcional.

Não usa Node nem Next.js: abra com o **Live Server** (ou qualquer servidor estático).

## Configurar

A URL e a chave **anon** ficam no **início de `app.js`** (e repetidas em **`auth-callback.html`** para o link de confirmação de e-mail). A anon **não é segredo** no navegador; o que protege os dados é o **RLS** no Supabase.

Ao trocar projeto ou chave: edite **os dois arquivos** com os mesmos valores. Veja `config.example.js` só como referência de formato.

**Nunca** coloque a chave **service_role** no repositório.

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
| `auth-callback.html` | Volta do link de confirmação de e-mail (mesma URL/chave anon que em `app.js`) |
| `config.example.js` | Referência — o app não importa este arquivo |

O `app.js` carrega o cliente Supabase via CDN (`esm.sh`); é preciso **internet** na primeira carga.

## Deploy estático

Envie `index.html`, `style.css`, `app.js` e `auth-callback.html`. Cadastre a URL de produção em **Redirect URLs** no Supabase.
