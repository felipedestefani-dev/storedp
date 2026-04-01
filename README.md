# Organizador de tarefas (site estático)

Organize lições e trabalhos no navegador: **adicionar**, **remover**, **marcar feito**, filtros e data de entrega opcional. Os dados ficam **salvos no armazenamento local do navegador** (`localStorage`) — sem login e sem servidor.

Não usa Node nem Next.js: abra `index.html` com o **Live Server** (ou qualquer servidor estático), ou arraste o arquivo para o navegador (em alguns navegadores `localStorage` funciona também em `file://`).

## Como abrir com o Live Server

1. No VS Code / Cursor, abra a pasta deste projeto.
2. Clique com o botão direito em `index.html` → **Open with Live Server** (extensão “Live Server”).
3. O site abre no navegador (geralmente porta **5500**).

## Arquivos principais

| Arquivo | Função |
| --- | --- |
| `index.html` | Página do painel |
| `style.css` | Estilos |
| `app.js` | Lógica e persistência local |

A pasta `supabase/migrations/` mantém um SQL de referência de um modelo antigo com banco remoto; o app atual **não depende** do Supabase.

## Deploy estático

Envie `index.html`, `style.css` e `app.js` para qualquer hospedagem de arquivos estáticos.
