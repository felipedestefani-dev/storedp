/**
 * Felipe Investments — app (refeito)
 * Credenciais: mesmas de antes (auth-callback.html + AUTH_STORAGE_KEY).
 */

const SUPABASE_URL = 'https://bxllfimygtmbzvrimfri.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bGxmaW15Z3RtYnp2cmltZnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjEzNjAsImV4cCI6MjA5MDc5NzM2MH0.FVB95KzUIIVEUtyUrQl5vdahjSm8ozeMYlC1Aci7wvA'
const AUTH_STORAGE_KEY = 'felipe-investments-auth-v1'

/** @typedef {'ganho'|'ganho_futuro'|'despesa'|'aporte'|'resgate'} Tx */

let sb
let entries = []
let filter = 'todos'
let mode = 'login'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function $(id) {
  return document.getElementById(id)
}

/** UMD expõe window.supabase = { createClient, ... } — cobrir variações. */
function getCreateClient() {
  const s = typeof window !== 'undefined' ? window.supabase : globalThis.supabase
  if (!s) return null
  if (typeof s.createClient === 'function') return s.createClient
  if (s.default && typeof s.default.createClient === 'function') return s.default.createClient
  return null
}

function showView(which) {
  const map = { auth: 'view-auth', dash: 'view-dash', config: 'view-config' }
  const id = map[which]
  ;['view-auth', 'view-dash', 'view-config'].forEach((vid) => {
    const el = $(vid)
    if (el) el.hidden = vid !== id
  })
}

function authBanner(msg, err) {
  const el = $('auth-banner')
  if (!el) return
  if (!msg) {
    el.hidden = true
    return
  }
  el.textContent = msg
  el.className = err ? 'banner banner--err' : 'banner banner--ok'
  el.hidden = false
}

function boardMsg(msg, kind) {
  const el = $('board-msg')
  if (!el) return
  if (!msg) {
    el.hidden = true
    return
  }
  el.textContent = msg
  el.className = kind === 'ok' ? 'banner banner--ok' : 'banner banner--err'
  el.hidden = false
}

function parseAuthErr(s) {
  if (!s) return { t: 'Erro.', resend: false }
  const x = String(s)
  if (/rate limit|429|security purposes/i.test(x)) return { t: 'Muitas tentativas. Aguarde ~1 min.', resend: false }
  if (/invalid login|invalid email or password/i.test(x)) return { t: 'E-mail ou senha incorretos.', resend: false }
  if (/email not confirmed|not confirmed|signup_not_completed/i.test(x))
    return { t: 'E-mail não confirmado. Veja o spam ou reenvie abaixo.', resend: true }
  return { t: x, resend: false }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function parseFlexibleDateToISO(raw) {
  if (!raw || typeof raw !== 'string') return null
  const s = raw.trim()
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const mAte = s.match(/até\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/i)
  const mPlain = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  const m = mAte || mPlain
  if (!m) return null
  const day = parseInt(m[1], 10)
  const month = parseInt(m[2], 10) - 1
  let year
  if (m[3] !== undefined && m[3] !== '') {
    let y = parseInt(m[3], 10)
    if (String(m[3]).length <= 2) y = 2000 + y
    year = y
  } else {
    year = new Date().getFullYear()
  }
  const dt = new Date(year, month, day)
  if (Number.isNaN(dt.getTime())) return null
  const y = dt.getFullYear()
  const mo = String(dt.getMonth() + 1).padStart(2, '0')
  const da = String(dt.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

function entryDateForInsert(raw) {
  const iso = parseFlexibleDateToISO(String(raw).trim())
  return iso ?? String(raw).trim()
}

function countsFuture(dateStr) {
  const iso = parseFlexibleDateToISO(dateStr)
  if (iso === null) return true
  return iso >= todayISO()
}

function totals() {
  let ganhos = 0,
    gf = 0,
    des = 0,
    ap = 0,
    res = 0
  for (const e of entries) {
    if (e.type === 'ganho') ganhos += e.amount
    else if (e.type === 'ganho_futuro' && countsFuture(e.date)) gf += e.amount
    else if (e.type === 'despesa') des += e.amount
    else if (e.type === 'aporte') ap += e.amount
    else if (e.type === 'resgate') res += e.amount
  }
  return { ganhos, gf, des, lucro: ganhos - des, inv: ap - res }
}

function fmt(n) {
  return brl.format(n)
}

function updateSummary() {
  const t = totals()
  const g = $('sum-ganhos')
  const gff = $('sum-ganhos-futuros')
  const d = $('sum-despesas')
  const l = $('sum-lucro')
  const i = $('sum-invest')
  if (!g || !gff || !d || !l || !i) return
  g.textContent = fmt(t.ganhos)
  gff.textContent = fmt(t.gf)
  d.textContent = fmt(t.des)
  l.textContent = fmt(t.lucro)
  l.classList.toggle('neg', t.lucro < 0)
  i.textContent = fmt(t.inv)
}

const typeLabel = {
  ganho: 'Ganho',
  ganho_futuro: 'Futuro',
  despesa: 'Despesa',
  aporte: 'Aporte',
  resgate: 'Resgate',
}

function amtClass(t) {
  if (t === 'ganho') return 'amt amt--gain'
  if (t === 'ganho_futuro') return 'amt amt--future'
  if (t === 'despesa') return 'amt amt--loss'
  return 'amt amt--inv'
}

function signed(e) {
  const b = fmt(e.amount)
  if (e.type === 'ganho_futuro') return `≈ ${b}`
  if (e.type === 'despesa' || e.type === 'aporte') return `− ${b}`
  if (e.type === 'resgate') return `+ ${b}`
  return `+ ${b}`
}

function lineDate(e) {
  const iso = parseFlexibleDateToISO(e.date)
  if (e.type === 'ganho_futuro') {
    if (iso) {
      const p = new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
      let s = `Previsão: ${p}`
      if (iso < todayISO()) s += ' · data passada (fora do total futuro)'
      return s
    }
    return `Previsão: ${e.date}`
  }
  if (iso) return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
  return e.date
}

function matchFilter(e) {
  if (filter === 'todos') return true
  if (filter === 'investimento') return e.type === 'aporte' || e.type === 'resgate'
  return e.type === filter
}

function mapRow(r) {
  return {
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    description: r.description ?? '',
    date: r.entry_date,
    created_at: r.created_at,
  }
}

function renderList() {
  const ul = $('item-list')
  const empty = $('list-empty')
  if (!ul || !empty) return
  const rows = entries.filter(matchFilter)
  ul.innerHTML = ''
  if (!rows.length) {
    const p = empty.querySelector('p')
    if (p) p.textContent = entries.length ? 'Nada neste filtro.' : 'Nenhum lançamento ainda.'
    empty.hidden = false
    return
  }
  empty.hidden = true
  for (const e of rows) {
    const li = document.createElement('li')
    li.className = 'row'
    const badge = document.createElement('span')
    badge.className = `badge badge--${e.type}`
    badge.textContent = typeLabel[e.type] || e.type
    const body = document.createElement('div')
    body.className = 'body'
    const t = document.createElement('div')
    t.className = 't'
    t.textContent = e.description
    const m = document.createElement('div')
    m.className = 'm'
    m.textContent = lineDate(e)
    body.appendChild(t)
    body.appendChild(m)
    const amt = document.createElement('div')
    amt.className = amtClass(e.type)
    amt.textContent = signed(e)
    const del = document.createElement('button')
    del.type = 'button'
    del.className = 'del'
    del.textContent = 'Excluir'
    del.addEventListener('click', () => delRow(e.id))
    li.appendChild(badge)
    li.appendChild(body)
    li.appendChild(amt)
    li.appendChild(del)
    ul.appendChild(li)
  }
}

async function loadEntries() {
  boardMsg('', 'err')
  const { data, error } = await sb
    .from('finance_entries')
    .select('id, type, amount, description, entry_date, created_at')
    .order('created_at', { ascending: false })
  if (error) {
    boardMsg(error.message || 'Erro ao carregar.', 'err')
    entries = []
    updateSummary()
    renderList()
    return false
  }
  entries = (data || []).map(mapRow)
  entries.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  updateSummary()
  renderList()
  return true
}

async function delRow(id) {
  if (!confirm('Excluir este lançamento?')) return
  boardMsg('', 'err')
  const { error } = await sb.from('finance_entries').delete().eq('id', id)
  if (error) {
    boardMsg(error.message, 'err')
    return
  }
  await loadEntries()
}

function parseValor(s) {
  const n = parseFloat(String(s).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : NaN
}

function syncLabel() {
  const tipo = $('tipo')
  const lab = $('data-label')
  const inp = $('data')
  if (!tipo || !lab || !inp) return
  if (tipo.value === 'ganho_futuro') {
    lab.textContent = 'Prazo / data'
    inp.placeholder = 'até 15/04 ou 2026-04-15'
  } else {
    lab.textContent = 'Data ou prazo'
    inp.placeholder = '2026-04-15 ou 15/04/2026'
  }
}

function filterTodos() {
  filter = 'todos'
  document.querySelectorAll('.chip').forEach((c) => {
    c.classList.toggle('chip--on', c.dataset.filter === 'todos')
  })
}

async function openDash(user) {
  const em = $('user-email')
  if (em) em.textContent = user.email ?? ''
  showView('dash')
  syncLabel()
  await loadEntries()
}

function openAuth() {
  showView('auth')
  authBanner('', false)
}

function clearStorage() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('sb-')) localStorage.removeItem(k)
    })
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith('sb-')) sessionStorage.removeItem(k)
    })
  } catch (e) {
    console.warn(e)
  }
}

async function doLogout() {
  try {
    await sb.auth.signOut({ scope: 'local' })
  } catch (e) {
    console.warn(e)
  }
  clearStorage()
  entries = []
  openAuth()
}

async function doAdd(ev) {
  ev.preventDefault()
  boardMsg('', 'err')
  const btn = $('btn-add')
  try {
    const {
      data: { session },
      error: se,
    } = await sb.auth.getSession()
    if (se) {
      boardMsg(se.message, 'err')
      return
    }
    if (!session?.user) {
      boardMsg('Sessão expirada. Entre de novo.', 'err')
      return
    }
    const tipo = /** @type {Tx} */ ($('tipo').value)
    const v = parseValor($('valor').value.trim())
    if (!Number.isFinite(v) || v <= 0) {
      boardMsg('Valor inválido (ex.: 10,50).', 'err')
      return
    }
    const desc = $('desc').value.trim()
    if (!desc) {
      boardMsg('Informe a descrição.', 'err')
      return
    }
    const raw = $('data').value.trim()
    if (!raw) {
      boardMsg('Informe data ou prazo.', 'err')
      return
    }
    if (raw.length > 120) {
      boardMsg('No máximo 120 caracteres no campo data.', 'err')
      return
    }
    const entry_date = entryDateForInsert(raw)
    if (btn) btn.disabled = true
    const { error } = await sb.from('finance_entries').insert({
      user_id: session.user.id,
      type: tipo,
      amount: v,
      description: desc,
      entry_date,
    })
    if (error) {
      let m = error.message || 'Erro ao salvar.'
      if (/date|invalid input|syntax/i.test(m))
        m +=
          ' Texto livre exige migration 003 (entry_date como text) ou use data reconhecível (ex.: 15/04/2026).'
      boardMsg(m, 'err')
      return
    }
    $('valor').value = ''
    $('desc').value = ''
    $('data').value = ''
    $('tipo').value = 'despesa'
    syncLabel()
    filterTodos()
    if (await loadEntries()) {
      boardMsg('Lançamento adicionado.', 'ok')
      $('item-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  } catch (err) {
    console.error(err)
    boardMsg(err instanceof Error ? err.message : 'Erro ao salvar.', 'err')
  } finally {
    if (btn) btn.disabled = false
  }
}

/**
 * Listeners diretos nos elementos (compatível com CSP sem onclick inline).
 * Um único registro por sessão de página.
 */
function attachUIHandlers() {
  if (window.__fiUIHandlers) return
  window.__fiUIHandlers = true

  const btnLogout = $('btn-logout')
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault()
      if (!sb) return
      void doLogout()
    })
  }

  const formAdd = $('form-add')
  if (formAdd) {
    formAdd.addEventListener('submit', (e) => {
      e.preventDefault()
      if (!sb) return
      doAdd(e).catch((err) => {
        console.error(err)
        boardMsg(err instanceof Error ? err.message : String(err), 'err')
      })
    })
  }

  const tl = $('tab-login')
  const tr = $('tab-register')
  if (tl) {
    tl.addEventListener('click', () => {
      mode = 'login'
      tl.classList.add('tab--on')
      tr?.classList.remove('tab--on')
      const b = $('btn-auth')
      if (b) b.textContent = 'Entrar'
      const pw = $('password')
      if (pw) pw.autocomplete = 'current-password'
    })
  }
  if (tr) {
    tr.addEventListener('click', () => {
      mode = 'register'
      tr.classList.add('tab--on')
      tl?.classList.remove('tab--on')
      const b = $('btn-auth')
      if (b) b.textContent = 'Criar conta'
      const pw = $('password')
      if (pw) pw.autocomplete = 'new-password'
    })
  }

  window.__fiLogout = () => {
    if (sb) void doLogout()
  }
  window.__fiAddSubmit = (e) => {
    if (e) e.preventDefault()
    if (!sb) return
    doAdd(e).catch((err) => {
      console.error(err)
      boardMsg(err instanceof Error ? err.message : String(err), 'err')
    })
  }
}

function bindRest() {
  const fa = $('form-auth')
  const br = $('btn-resend')
  const tipo = $('tipo')
  if (!fa) {
    authBanner('Erro interno: formulário de login não encontrado. Recarregue (F5).', true)
    return
  }

  fa.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    const email = $('email').value.trim()
    const pw = $('password').value
    const redir = new URL('auth-callback.html', location.href).href
    const b = $('btn-auth')
    b.disabled = true
    const prev = b.textContent
    b.textContent = 'Aguarde…'
    authBanner('', false)
    try {
      if (mode === 'register') {
        const { data, error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: redir } })
        if (error) {
          const p = parseAuthErr(error.message)
          authBanner(p.t, true)
          $('auth-resend').hidden = !p.resend
          return
        }
        if (data.session?.user) {
          await openDash(data.user)
          return
        }
        authBanner('Conta criada. Confirme o e-mail (spam) ou desative confirmação no Supabase em dev.', false)
        return
      }
      const { data: si, error } = await sb.auth.signInWithPassword({ email, password: pw })
      if (error) {
        const p = parseAuthErr(error.message)
        authBanner(p.t, true)
        $('auth-resend').hidden = !p.resend
        return
      }
      const u = si?.session?.user ?? si?.user
      if (u) await openDash(u)
      else {
        const { data: r } = await sb.auth.getSession()
        if (r.session?.user) await openDash(r.session.user)
        else authBanner('Sessão não criada.', true)
      }
    } catch (e) {
      console.error(e)
      authBanner(e instanceof Error ? e.message : 'Erro.', true)
    } finally {
      b.disabled = false
      b.textContent = prev
    }
  })

  if (br) {
    br.addEventListener('click', async () => {
    const email = $('email').value.trim()
    if (!email) {
      authBanner('Digite o e-mail.', true)
      return
    }
    const x = br
    x.disabled = true
    const { error } = await sb.auth.resend({ type: 'signup', email, options: { emailRedirectTo: new URL('auth-callback.html', location.href).href } })
    x.disabled = false
    if (error) authBanner(error.message, true)
    else authBanner('E-mail reenviado.', false)
    })
  }

  if (tipo) tipo.addEventListener('change', syncLabel)

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter || 'todos'
      document.querySelectorAll('.chip').forEach((c) => c.classList.remove('chip--on'))
      chip.classList.add('chip--on')
      renderList()
    })
  })
}

async function start() {
  const create = getCreateClient()
  if (typeof create !== 'function') {
    showView('auth')
    authBanner(
      'Biblioteca Supabase não carregou. Abra por HTTP (ex.: npx serve), não por file://, e verifique rede/bloqueador.',
      true
    )
    return
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    showView('config')
    return
  }

  try {
    sb = create(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storageKey: AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  } catch (e) {
    console.error(e)
    showView('auth')
    authBanner('Falha ao iniciar o Supabase: ' + (e instanceof Error ? e.message : String(e)), true)
    return
  }

  attachUIHandlers()
  bindRest()
  console.info('[Felipe Investments] UI ligada.')

  sb.auth.onAuthStateChange(async (event, sess) => {
    if (event === 'INITIAL_SESSION') return
    if (event === 'SIGNED_IN' && sess?.user) await openDash(sess.user)
    if (event === 'SIGNED_OUT') {
      entries = []
      openAuth()
    }
  })

  showView('auth')
  const {
    data: { session },
    error,
  } = await sb.auth.getSession()
  if (error) authBanner(error.message || 'Erro de sessão.', true)
  if (session?.user) await openDash(session.user)
  else openAuth()
}

start().catch((e) => {
  console.error(e)
  showView('auth')
  authBanner(String(e.message || e), true)
})
