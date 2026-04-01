import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

/* Supabase — mesmos valores em auth-callback.html (confirmação de e-mail) */
const SUPABASE_URL = 'https://eqimwuwbzwfrebzjggux.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxaW13dXdiendmcmViempnZ3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDg1OTEsImV4cCI6MjA5MDU4NDU5MX0.HgjF-FFRxK2c0JqUY2XjsYLfPpupt0eZ94FFugVetgc'

let supabase
let currentFilter = 'todos'
let assignments = []

function showScreen(id) {
  for (const el of document.querySelectorAll('.screen')) {
    el.hidden = el.id !== id
  }
}

function setAuthBanner(msg, isError, opts = {}) {
  const showResend = Boolean(opts.showResend)
  const el = document.getElementById('auth-banner')
  const wrap = document.getElementById('auth-resend-wrap')
  if (!msg) {
    el.hidden = true
    if (wrap) wrap.hidden = true
    return
  }
  el.textContent = msg
  el.className = `banner ${isError ? 'bannerError' : 'bannerInfo'}`
  el.hidden = false
  if (wrap) wrap.hidden = !showResend
}

/**
 * Traduz erros do Supabase. O login falha se o e-mail não foi confirmado (configuração no painel).
 * @returns {{ message: string, showResend: boolean }}
 */
function parseAuthError(raw) {
  if (!raw) return { message: 'Algo deu errado. Tente de novo.', showResend: false }
  const s = String(raw)
  if (/security purposes|only request this after|rate limit|too many requests|429|email rate limit/i.test(s)) {
    return {
      message:
        'Muitas tentativas seguidas. Aguarde cerca de 1 minuto e tente de novo. (Authentication → Rate Limits no Supabase.)',
      showResend: false,
    }
  }
  if (/invalid login credentials|invalid email or password/i.test(s)) {
    return { message: 'E-mail ou senha incorretos.', showResend: false }
  }
  if (/email not confirmed|not confirmed|confirm your email|signup_not_completed|Email link is invalid or has expired/i.test(s)) {
    return {
      message:
        'Este e-mail ainda não foi confirmado (por isso o login falha). Veja o spam. Ou use o botão abaixo para reenviar. No Supabase: Authentication → Providers → Email → desative "Confirm email" para entrar sem precisar do e-mail.',
      showResend: true,
    }
  }
  return { message: s, showResend: false }
}

function setBoardError(msg) {
  const el = document.getElementById('board-error')
  if (!msg) {
    el.hidden = true
    return
  }
  el.textContent = msg
  el.hidden = false
}

function getFiltered() {
  if (currentFilter === 'todos') return assignments
  return assignments.filter((a) => a.kind === currentFilter)
}

function renderList() {
  const list = document.getElementById('item-list')
  const empty = document.getElementById('list-empty')
  const rows = getFiltered()

  list.innerHTML = ''
  if (rows.length === 0) {
    empty.hidden = false
    return
  }
  empty.hidden = true

  for (const a of rows) {
    const li = document.createElement('li')
    li.className = `itemRow ${a.completed ? 'itemRowDone' : ''}`
    li.dataset.id = a.id

    const checkBtn = document.createElement('button')
    checkBtn.type = 'button'
    checkBtn.className = 'checkBtn'
    checkBtn.title = a.completed ? 'Marcar como não feito' : 'Marcar como feito'
    checkBtn.setAttribute('aria-pressed', String(a.completed))
    const box = document.createElement('span')
    box.className = 'checkBox'
    box.textContent = a.completed ? '✓' : ''
    checkBtn.appendChild(box)
    checkBtn.addEventListener('click', () => toggleDone(a))

    const body = document.createElement('div')
    body.className = 'itemBody'
    const top = document.createElement('div')
    top.className = 'itemTop'
    const kind = document.createElement('span')
    kind.className = 'itemKind'
    kind.textContent = a.kind
    top.appendChild(kind)
    if (a.due_date) {
      const due = document.createElement('span')
      due.className = 'itemDue'
      due.textContent = `Entrega: ${new Date(a.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}`
      top.appendChild(due)
    }
    const title = document.createElement('div')
    title.className = `itemTitle ${a.completed ? 'itemTitleDone' : ''}`
    title.textContent = a.title
    body.appendChild(top)
    body.appendChild(title)
    if (a.notes) {
      const notes = document.createElement('p')
      notes.className = 'itemNotes'
      notes.textContent = a.notes
      body.appendChild(notes)
    }

    const del = document.createElement('button')
    del.type = 'button'
    del.className = 'btn btnDanger btnSm'
    del.textContent = 'Remover'
    del.addEventListener('click', () => removeItem(a.id))

    li.appendChild(checkBtn)
    li.appendChild(body)
    li.appendChild(del)
    list.appendChild(li)
  }
}

function updateStats() {
  const pending = assignments.filter((a) => !a.completed).length
  document.getElementById('board-stats').textContent = `${pending} pendente(s) · ${assignments.length} no total`
}

async function loadAssignments() {
  setBoardError('')
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    const hint =
      error.message && error.message.includes('relation')
        ? 'Crie a tabela no Supabase (veja supabase/migrations/001_assignments.sql).'
        : error.message
    setBoardError(hint)
    assignments = []
  } else {
    assignments = data ?? []
  }
  updateStats()
  renderList()
}

async function toggleDone(a) {
  setBoardError('')
  const { error } = await supabase.from('assignments').update({ completed: !a.completed }).eq('id', a.id)
  if (error) {
    setBoardError(error.message)
    return
  }
  await loadAssignments()
}

async function removeItem(id) {
  if (!confirm('Remover este item?')) return
  setBoardError('')
  const { error } = await supabase.from('assignments').delete().eq('id', id)
  if (error) {
    setBoardError(error.message)
    return
  }
  await loadAssignments()
}

async function showDashboard(user) {
  document.getElementById('user-email').textContent = user.email ?? ''
  showScreen('screen-dashboard')
  assignments = []
  updateStats()
  await loadAssignments()
}

function showLanding() {
  showScreen('screen-landing')
}

function showAuth() {
  setAuthBanner('', true)
  showScreen('screen-auth')
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    showScreen('screen-config-missing')
    return
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.user) {
    await showDashboard(session.user)
  } else {
    showLanding()
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      await showDashboard(session.user)
    } else if (event === 'SIGNED_OUT') {
      showLanding()
    }
  })

  document.getElementById('btn-open-auth').addEventListener('click', showAuth)
  document.getElementById('btn-back-landing').addEventListener('click', showLanding)

  let mode = 'login'
  const tabLogin = document.getElementById('tab-login')
  const tabRegister = document.getElementById('tab-register')
  const btnSubmit = document.getElementById('btn-auth-submit')

  function setMode(m) {
    mode = m
    tabLogin.classList.toggle('authTabActive', m === 'login')
    tabRegister.classList.toggle('authTabActive', m === 'register')
    btnSubmit.textContent = m === 'login' ? 'Entrar' : 'Cadastrar'
    document.getElementById('password').autocomplete = m === 'login' ? 'current-password' : 'new-password'
    setAuthBanner('', true)
  }

  tabLogin.addEventListener('click', () => setMode('login'))
  tabRegister.addEventListener('click', () => setMode('register'))

  document.getElementById('btn-resend-confirm').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim()
    const redirectTo = new URL('auth-callback.html', window.location.href).href
    if (!email) {
      setAuthBanner('Digite seu e-mail no campo acima.', true)
      return
    }
    const btn = document.getElementById('btn-resend-confirm')
    btn.disabled = true
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: redirectTo },
    })
    btn.disabled = false
    if (error) {
      const parsed = parseAuthError(error.message)
      setAuthBanner(parsed.message, true, { showResend: parsed.showResend })
      return
    }
    setAuthBanner('Enviamos outro e-mail. Confira a caixa de entrada e o spam.', false)
    document.getElementById('auth-resend-wrap').hidden = true
  })

  let authSubmitting = false
  document.getElementById('form-auth').addEventListener('submit', async (e) => {
    e.preventDefault()
    if (authSubmitting) return
    authSubmitting = true
    btnSubmit.disabled = true
    const prevLabel = btnSubmit.textContent
    btnSubmit.textContent = 'Aguarde…'
    setAuthBanner('', true)

    try {
      const email = document.getElementById('email').value.trim()
      const password = document.getElementById('password').value
      const redirectTo = new URL('auth-callback.html', window.location.href).href

      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        })
        if (error) {
          const parsed = parseAuthError(error.message)
          setAuthBanner(parsed.message, true, { showResend: parsed.showResend })
          return
        }
        if (data.session && data.user) {
          await showDashboard(data.user)
          return
        }
        setAuthBanner(
          'Conta criada. Abra o link de confirmação no e-mail (confira o spam). Se nada chegar: no Supabase, Authentication → Providers → Email, desative "Confirm email" e cadastre de novo ou confirme o usuário em Authentication → Users.',
          false
        )
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const parsed = parseAuthError(error.message)
        setAuthBanner(parsed.message, true, { showResend: parsed.showResend })
        return
      }
    } finally {
      authSubmitting = false
      btnSubmit.disabled = false
      btnSubmit.textContent = prevLabel
    }
  })

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await supabase.auth.signOut()
    showLanding()
  })

  document.getElementById('form-add').addEventListener('submit', async (e) => {
    e.preventDefault()
    setBoardError('')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const title = document.getElementById('titulo').value.trim()
    if (!title) return

    const kind = document.getElementById('tipo').value
    const due = document.getElementById('entrega').value
    const notes = document.getElementById('obs').value.trim()

    const { error } = await supabase.from('assignments').insert({
      user_id: user.id,
      title,
      notes,
      kind,
      due_date: due || null,
      completed: false,
    })

    if (error) {
      setBoardError(error.message)
      return
    }

    document.getElementById('titulo').value = ''
    document.getElementById('entrega').value = ''
    document.getElementById('obs').value = ''
    document.getElementById('tipo').value = 'trabalho'
    await loadAssignments()
  })

  document.querySelectorAll('.filterChip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter
      currentFilter = f
      document.querySelectorAll('.filterChip').forEach((b) => b.classList.remove('filterChipActive'))
      btn.classList.add('filterChipActive')
      renderList()
      const empty = document.getElementById('list-empty')
      empty.querySelector('p').textContent =
        getFiltered().length === 0 && assignments.length > 0 ? 'Nada neste filtro.' : 'Nada aqui ainda.'
    })
  })
}

main().catch((err) => {
  console.error(err)
  const el = document.getElementById('auth-banner')
  if (el) {
    el.textContent = String(err.message || err)
    el.className = 'banner bannerError'
    el.hidden = false
    showScreen('screen-auth')
  }
})
