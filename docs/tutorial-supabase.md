# Tutorial: conectar o Felipe Investments ao Supabase

Este guia explica como criar o projeto no Supabase, **onde achar a URL e a chave anon**, colar no site e deixar login e banco funcionando.

---

## O que você vai usar no código

| Dado | Onde aparece no painel Supabase | Para que serve |
| --- | --- | --- |
| **Project URL** | Project Settings → API → **Project URL** | Endereço da API do seu projeto (algo como `https://abcdefgh.supabase.co`). |
| **anon public** | Project Settings → API → **Project API keys** → chave **anon** **public** | Chave usada no navegador pelo `app.js`. Com RLS ligado, ela só faz o que as regras do banco permitem. |

**Não use no site a chave `service_role` (secret).** Ela ignora RLS e dá acesso total ao banco — é só para servidor/backend, nunca no front.

---

## Passo 1: Criar conta e projeto

1. Acesse [https://supabase.com](https://supabase.com) e faça login (GitHub ou e-mail).
2. Clique em **New project**.
3. Escolha organização, **nome do projeto**, **senha do banco** (anote em lugar seguro) e região.
4. Aguarde o projeto ficar **Ready** (pode levar um ou dois minutos).

---

## Passo 2: Copiar URL e chave anon

1. No menu lateral, clique no ícone de **engrenagem** → **Project Settings**.
2. No menu da esquerda, abra **API**.
3. Em **Project URL**, copie o endereço (ex.: `https://xxxxxxxx.supabase.co`).
4. Mais abaixo, em **Project API keys**, localize a chave **anon** **public** (texto longo começando com `eyJ...`).
5. Use o botão de copiar ao lado de cada um.

Esses dois valores são os que você cola no **`app.js`** e no **`auth-callback.html`**.

---

## Passo 3: Criar a tabela no banco (SQL)

1. No menu lateral, vá em **SQL Editor**.
2. Clique em **New query**.
3. Abra no seu computador o arquivo  
   `supabase/migrations/002_finance_entries.sql`  
   do projeto, copie **todo** o conteúdo e cole no editor.
4. Clique em **Run** (ou Ctrl+Enter).
5. Deve aparecer sucesso, sem erro. Isso cria a tabela `finance_entries` e as políticas RLS (cada usuário só vê os próprios dados).

---

## Passo 4: Colar URL e anon no site

### Em `app.js`

No **início** do arquivo, substitua as strings vazias:

```js
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOi...cole a chave anon completa...'
```

- A URL vai entre aspas, **exatamente** como no painel (com `https://`).
- A chave anon é uma linha só, inteira, entre aspas.

### Em `auth-callback.html`

No `<script type="module">`, há as **mesmas** duas constantes. Coloque **os mesmos valores** que no `app.js`.  
Isso é necessário para o link de **confirmação de e-mail** funcionar após o cadastro.

Salve os dois arquivos.

---

## Passo 5: Configurar URLs de autenticação

Sem isso, o login pode falhar ou o redirect após o e-mail não abre certo.

1. No menu lateral: **Authentication** → **URL Configuration** (ou **Providers** dependendo da versão do painel; procure **Site URL** e **Redirect URLs**).
2. **Site URL**: coloque a URL base onde você abre o site.
   - Exemplo no PC com Live Server: `http://127.0.0.1:5500`  
     (troque **5500** se a sua porta for outra.)
3. **Redirect URLs**: adicione **uma linha por URL**, por exemplo:
   - `http://127.0.0.1:5500/auth-callback.html`
   - `http://localhost:5500/auth-callback.html`
   - Se publicar no GitHub Pages: `https://seu-usuario.github.io/seu-repo/auth-callback.html`
4. Salve as alterações.

---

## Passo 6: E-mail e senha (opcional em testes)

Por padrão o Supabase pode exigir **confirmação de e-mail** antes de logar.

- **Produção:** deixe confirmar e-mail e use o link que chega na caixa de entrada (e spam).
- **Testes rápidos:** **Authentication** → **Providers** → **Email** → desative **Confirm email** (só em ambiente de desenvolvimento).

---

## Passo 7: Testar

1. Abra o projeto no VS Code / Cursor e use **Live Server** (ou outro servidor estático) em `index.html`.
2. A página deve carregar a tela de **Entrar / Criar conta**.
3. Crie uma conta ou entre com e-mail e senha.
4. No painel, adicione um lançamento. Se algo der errado, a mensagem de erro costuma indicar permissão (RLS), URL errada ou rede.

---

## Problemas comuns

| Sintoma | O que verificar |
| --- | --- |
| Tela “Configurar Supabase” | `SUPABASE_URL` ou `SUPABASE_ANON_KEY` vazios ou errados no `app.js`. |
| Erro de CORS ou URL | URL com typo, sem `https://`, ou projeto pausado no Supabase. |
| Login sempre falha | Redirect URLs não incluem `auth-callback.html` com a porta certa. |
| “Invalid API key” | Colou `service_role` no lugar da **anon**, ou chave truncada. |
| Dados não aparecem | Não rodou o SQL do `002_finance_entries.sql` ou erro nas políticas RLS. |
| E-mail não chega | Spam, ou desative “Confirm email” só para testes. |

---

## Resumo rápido

1. **Project Settings → API** → copiar **Project URL** + chave **anon public**.  
2. Colar em **`app.js`** e **`auth-callback.html`**.  
3. **SQL Editor** → rodar `002_finance_entries.sql`.  
4. **Authentication → URL Configuration** → Site URL + Redirect URLs com `auth-callback.html`.  
5. Abrir o site e criar conta / entrar.

Se quiser, no próximo passo você pode publicar o front (Netlify, GitHub Pages, etc.) e repetir o passo 5 com a URL pública do site.
