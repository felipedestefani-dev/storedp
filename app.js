/* Felipe Investments */

var SUPABASE_URL = 'https://viawfdrmaolalvmadaob.supabase.co'
var SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpYXdmZHJtYW9sYWx2bWFkYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTkzMjAsImV4cCI6MjA5MDgzNTMyMH0.sko86wOnNoBAhqmP0gwC8PO9yH8SMML7NZHZWbsNkxQ'
var AUTH_STORAGE_KEY = 'fi-auth-v2'

var sb = null
var entries = []
var filter = 'todos'
var mode = 'login'
var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function $(id) { return document.getElementById(id) }

function showView(which) {
  var map = { auth: 'view-auth', dash: 'view-dash', config: 'view-config' }
  var target = map[which]
  ;['view-auth', 'view-dash', 'view-config'].forEach(function (vid) {
    var el = $(vid)
    if (el) el.hidden = (vid !== target)
  })
}

function authBanner(msg, err) {
  var el = $('auth-banner')
  if (!el) return
  if (!msg) { el.hidden = true; return }
  el.textContent = msg
  el.className = err ? 'banner banner--err' : 'banner banner--ok'
  el.hidden = false
}

function boardMsg(msg, kind) {
  var el = $('board-msg')
  if (!el) return
  if (!msg) { el.hidden = true; return }
  el.textContent = msg
  el.className = kind === 'ok' ? 'banner banner--ok' : 'banner banner--err'
  el.hidden = false
}

function parseAuthErr(s) {
  if (!s) return { t: 'Erro.', resend: false }
  var x = String(s)
  if (/rate limit|429|security purposes/i.test(x)) return { t: 'Muitas tentativas. Aguarde ~1 min.', resend: false }
  if (/invalid login|invalid email or password/i.test(x)) return { t: 'E-mail ou senha incorretos.', resend: false }
  if (/email not confirmed|not confirmed|signup_not_completed/i.test(x))
    return { t: 'E-mail não confirmado. Veja o spam ou reenvie abaixo.', resend: true }
  return { t: x, resend: false }
}

function todayISO() { return new Date().toISOString().slice(0, 10) }

function fmt(n) { return brl.format(n) }

function totals() {
  var ganhos = 0, gf = 0, des = 0, ap = 0, res = 0
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.type === 'ganho') ganhos += e.amount
    else if (e.type === 'ganho_futuro' && e.date >= todayISO()) gf += e.amount
    else if (e.type === 'despesa') des += e.amount
    else if (e.type === 'aporte') ap += e.amount
    else if (e.type === 'resgate') res += e.amount
  }
  return { ganhos: ganhos, gf: gf, des: des, lucro: ganhos - des, inv: ap - res }
}

function updateSummary() {
  var t = totals()
  var g = $('sum-ganhos'), gff = $('sum-ganhos-futuros'), d = $('sum-despesas'), l = $('sum-lucro'), iv = $('sum-invest')
  if (!g || !gff || !d || !l || !iv) return
  g.textContent = fmt(t.ganhos)
  gff.textContent = fmt(t.gf)
  d.textContent = fmt(t.des)
  l.textContent = fmt(t.lucro)
  l.classList.toggle('neg', t.lucro < 0)
  iv.textContent = fmt(t.inv)
}

var typeLabel = { ganho: 'Ganho', ganho_futuro: 'Futuro', despesa: 'Despesa', aporte: 'Aporte', resgate: 'Resgate' }

function amtClass(t) {
  if (t === 'ganho') return 'amt amt--gain'
  if (t === 'ganho_futuro') return 'amt amt--future'
  if (t === 'despesa') return 'amt amt--loss'
  return 'amt amt--inv'
}

function signed(e) {
  var b = fmt(e.amount)
  if (e.type === 'ganho_futuro') return '≈ ' + b
  if (e.type === 'despesa' || e.type === 'aporte') return '− ' + b
  return '+ ' + b
}

function lineDate(e) {
  if (!e.date) return ''
  try {
    var d = new Date(e.date + 'T12:00:00')
    var s = d.toLocaleDateString('pt-BR')
    if (e.type === 'ganho_futuro') {
      s = 'Previsão: ' + s
      if (e.date < todayISO()) s += ' · passada'
    }
    return s
  } catch (_) { return e.date }
}

function matchFilter(e) {
  if (filter === 'todos') return true
  if (filter === 'investimento') return e.type === 'aporte' || e.type === 'resgate'
  return e.type === filter
}

function renderList() {
  var ul = $('item-list'), empty = $('list-empty')
  if (!ul || !empty) return
  var rows = entries.filter(matchFilter)
  ul.innerHTML = ''
  if (!rows.length) {
    var p = empty.querySelector('p')
    if (p) p.textContent = entries.length ? 'Nada neste filtro.' : 'Nenhum lançamento ainda.'
    empty.hidden = false
    return
  }
  empty.hidden = true
  rows.forEach(function (e) {
    var li = document.createElement('li'); li.className = 'row'
    var badge = document.createElement('span'); badge.className = 'badge badge--' + e.type; badge.textContent = typeLabel[e.type] || e.type
    var body = document.createElement('div'); body.className = 'body'
    var t = document.createElement('div'); t.className = 't'; t.textContent = e.description
    var m = document.createElement('div'); m.className = 'm'; m.textContent = lineDate(e)
    body.appendChild(t); body.appendChild(m)
    var amt = document.createElement('div'); amt.className = amtClass(e.type); amt.textContent = signed(e)
    var del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = 'Excluir'
    del.setAttribute('data-id', e.id)
    li.appendChild(badge); li.appendChild(body); li.appendChild(amt); li.appendChild(del)
    ul.appendChild(li)
  })
}

function loadEntries() {
  boardMsg('', 'err')
  return sb.from('finance_entries')
    .select('id, type, amount, description, entry_date, created_at')
    .order('created_at', { ascending: false })
    .then(function (res) {
      if (res.error) {
        console.error('[FI] loadEntries erro:', res.error.message)
        boardMsg(res.error.message || 'Erro ao carregar.', 'err')
        entries = []
      } else {
        console.info('[FI] loadEntries:', (res.data || []).length, 'registros')
        entries = (res.data || []).map(function (r) {
          return { id: r.id, type: r.type, amount: Number(r.amount), description: r.description || '', date: r.entry_date, created_at: r.created_at }
        })
      }
      updateSummary()
      renderList()
      return !res.error
    })
}

function delRow(id) {
  if (!confirm('Excluir este lançamento?')) return
  boardMsg('', 'err')
  sb.from('finance_entries').delete().eq('id', id).then(function (res) {
    if (res.error) { boardMsg(res.error.message, 'err'); return }
    loadEntries()
  })
}

function openDash(user) {
  var em = $('user-email')
  if (em) em.textContent = user.email || ''
  showView('dash')
  var tipo = $('tipo'), lab = $('data-label')
  if (tipo && lab) lab.textContent = tipo.value === 'ganho_futuro' ? 'Prazo / data' : 'Data'
  loadEntries()
}

function openAuth() {
  showView('auth')
  authBanner('', false)
}

function doLogout() {
  sb.auth.signOut({ scope: 'local' }).catch(function () {})
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    Object.keys(localStorage).forEach(function (k) { if (k.startsWith('sb-')) localStorage.removeItem(k) })
  } catch (_) {}
  entries = []
  openAuth()
}

function doAdd() {
  boardMsg('', 'err')
  var btn = $('btn-add')
  return sb.auth.getSession().then(function (r) {
    var session = r.data ? r.data.session : null
    if (!session || !session.user) { boardMsg('Sessão expirada. Entre de novo.', 'err'); return }
    var tipo = $('tipo').value
    var raw = $('valor').value.trim()
    var v = parseFloat(raw.replace(',', '.'))
    if (!isFinite(v) || v <= 0) { boardMsg('Valor inválido (ex.: 10,50).', 'err'); return }
    var desc = $('desc').value.trim()
    if (!desc) { boardMsg('Informe a descrição.', 'err'); return }
    var entry_date = $('data').value
    if (!entry_date) { boardMsg('Selecione uma data.', 'err'); return }
    if (btn) btn.disabled = true
    return sb.from('finance_entries').insert({
      user_id: session.user.id,
      type: tipo,
      amount: v,
      description: desc,
      entry_date: entry_date,
    }).then(function (res) {
      if (res.error) { boardMsg(res.error.message || 'Erro ao salvar.', 'err'); return }
      $('valor').value = ''
      $('desc').value = ''
      $('data').value = ''
      $('tipo').value = 'despesa'
      filter = 'todos'
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('chip--on', c.dataset.filter === 'todos') })
      loadEntries().then(function () {
        boardMsg('Lançamento adicionado.', 'ok')
      })
    })
  }).catch(function (err) {
    console.error(err)
    boardMsg(String(err.message || err), 'err')
  }).finally(function () {
    if (btn) btn.disabled = false
  })
}

function wireUI() {
  // Logout
  var btnLogout = $('btn-logout')
  if (btnLogout) btnLogout.onclick = function (e) { e.preventDefault(); doLogout() }

  // Add entry
  var formAdd = $('form-add')
  if (formAdd) formAdd.onsubmit = function (e) { e.preventDefault(); doAdd() }

  // Tabs
  var tl = $('tab-login'), tr = $('tab-register')
  if (tl) tl.onclick = function () {
    mode = 'login'; tl.classList.add('tab--on'); if (tr) tr.classList.remove('tab--on')
    var b = $('btn-auth'); if (b) b.textContent = 'Entrar'
  }
  if (tr) tr.onclick = function () {
    mode = 'register'; tr.classList.add('tab--on'); if (tl) tl.classList.remove('tab--on')
    var b = $('btn-auth'); if (b) b.textContent = 'Criar conta'
  }

  // Auth form
  var fa = $('form-auth')
  if (fa) fa.onsubmit = function (e) {
    e.preventDefault()
    var email = $('email').value.trim()
    var pw = $('password').value
    var b = $('btn-auth'); b.disabled = true; var prev = b.textContent; b.textContent = 'Aguarde…'
    authBanner('', false)
    var done = function () { b.disabled = false; b.textContent = prev }
    var redir = new URL('auth-callback.html', location.href).href

    if (mode === 'register') {
      sb.auth.signUp({ email: email, password: pw, options: { emailRedirectTo: redir } }).then(function (res) {
        if (res.error) { var p = parseAuthErr(res.error.message); authBanner(p.t, true); $('auth-resend').hidden = !p.resend; return }
        if (res.data.session && res.data.session.user) { openDash(res.data.session.user); return }
        authBanner('Conta criada. Confirme o e-mail (verifique spam).', false)
      }).catch(function (err) { authBanner(String(err.message || err), true) }).finally(done)
    } else {
      sb.auth.signInWithPassword({ email: email, password: pw }).then(function (res) {
        if (res.error) { var p = parseAuthErr(res.error.message); authBanner(p.t, true); $('auth-resend').hidden = !p.resend; return }
        var u = (res.data.session && res.data.session.user) || res.data.user
        if (u) openDash(u)
        else authBanner('Sessão não criada.', true)
      }).catch(function (err) { authBanner(String(err.message || err), true) }).finally(done)
    }
  }

  // Resend
  var br = $('btn-resend')
  if (br) br.onclick = function () {
    var email = $('email').value.trim()
    if (!email) { authBanner('Digite o e-mail.', true); return }
    br.disabled = true
    sb.auth.resend({ type: 'signup', email: email, options: { emailRedirectTo: new URL('auth-callback.html', location.href).href } })
      .then(function (res) { if (res.error) authBanner(res.error.message, true); else authBanner('E-mail reenviado.', false) })
      .finally(function () { br.disabled = false })
  }

  // Tipo change
  var tipo = $('tipo')
  if (tipo) tipo.onchange = function () {
    var lab = $('data-label')
    if (lab) lab.textContent = tipo.value === 'ganho_futuro' ? 'Prazo / data' : 'Data'
  }

  // Chips
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.onclick = function () {
      filter = chip.dataset.filter || 'todos'
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('chip--on') })
      chip.classList.add('chip--on')
      renderList()
    }
  })

  // Delete (delegado no list)
  var list = $('item-list')
  if (list) list.onclick = function (e) {
    var btn = e.target
    if (!btn || !btn.classList.contains('del')) return
    var id = btn.getAttribute('data-id')
    if (id) delRow(id)
  }

  console.info('[FI] UI pronta.')
}

function boot() {
  var createClient = null
  try {
    var s = window.supabase
    if (s && typeof s.createClient === 'function') createClient = s.createClient
  } catch (_) {}

  if (!createClient) {
    showView('auth')
    authBanner('Supabase não carregou. Use HTTP (não file://) e verifique a rede.', true)
    return
  }

  sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { storageKey: AUTH_STORAGE_KEY, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  })

  wireUI()

  sb.auth.onAuthStateChange(function (event, sess) {
    console.info('[FI] auth:', event)
    if (event === 'SIGNED_IN' && sess && sess.user) openDash(sess.user)
    if (event === 'SIGNED_OUT') { entries = []; openAuth() }
  })

  sb.auth.getSession().then(function (res) {
    var sess = res.data ? res.data.session : null
    console.info('[FI] sessão:', sess ? sess.user.email : 'nenhuma')
    if (sess && sess.user) openDash(sess.user)
    else openAuth()
  }).catch(function (err) {
    console.error('[FI] getSession erro:', err)
    openAuth()
  })
}

boot()
