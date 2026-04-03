#!/usr/bin/env node
/**
 * Deploy (Netlify/Vercel/GitHub Actions) costuma exigir `npm run build`.
 * Este projeto não compila nada; só verifica se os arquivos principais existem.
 */
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const need = ['index.html', 'app.js', 'style.css', 'auth-callback.html']
for (const f of need) {
  const p = path.join(root, f)
  if (!fs.existsSync(p)) {
    console.error('Missing:', f)
    process.exit(1)
  }
}
console.log('Static site OK:', need.join(', '))
