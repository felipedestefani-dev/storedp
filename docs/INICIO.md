# Começar

## Site estático (Live Server)

1. Copie `config.example.js` → `config.js` e preencha `SUPABASE_ANON_KEY`.
2. Rode o SQL em `supabase/migrations/001_assignments.sql` no Supabase.
3. No Supabase, configure **Redirect URLs** com `http://127.0.0.1:5500/auth-callback.html` (porta do Live Server).
4. Abra a pasta no editor, clique direito em `index.html` → **Open with Live Server**.

## Rotas “virtuais”

Tudo está em `index.html`; não há rotas `/dashboard` separadas — o JavaScript troca as telas.

## Documentação

- [Supabase JS](https://supabase.com/docs/reference/javascript/introduction)
- [Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
