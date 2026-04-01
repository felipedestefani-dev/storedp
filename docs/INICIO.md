# Começar

## Site estático (Live Server)

1. Copie `config.example.js` → `config.js` e preencha `SUPABASE_ANON_KEY`.
2. Rode o SQL em `supabase/migrations/001_assignments.sql` no Supabase.
3. No Supabase, configure **Redirect URLs** com a URL do Live Server (`http://127.0.0.1:5500/auth-callback.html`) **e** a URL do site publicado (ex.: `https://seu-usuario.github.io/nome-do-repo/auth-callback.html`).
4. Abra a pasta no editor, clique direito em `index.html` → **Open with Live Server**.

O arquivo `config.js` deve existir no deploy (pode ir no Git); sem ele o site mostra só a tela de configuração.

## Rotas “virtuais”

Tudo está em `index.html`; não há rotas `/dashboard` separadas — o JavaScript troca as telas.

## Documentação

- [Supabase JS](https://supabase.com/docs/reference/javascript/introduction)
- [Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
