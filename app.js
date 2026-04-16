/* Neyfel Tech — Monte seu PC (Supabase) */

// 1) Cole aqui seus dados do Supabase (Project Settings → API)
var SUPABASE_URL = 'https://viawfdrmaolalvmadaob.supabase.co'
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpYXdmZHJtYW9sYWx2bWFkYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTkzMjAsImV4cCI6MjA5MDgzNTMyMH0.sko86wOnNoBAhqmP0gwC8PO9yH8SMML7NZHZWbsNkxQ'

var BUCKET = 'pc-images'
var SIGNED_URL_TTL_SECONDS = 60 * 60 // 1h

var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
function fmt(n) { return brl.format(n || 0) }
function $(id) { return document.getElementById(id) }

function toast(msg) {
  var el = $('toast')
  if (!el) return
  if (!msg) { el.hidden = true; return }
  el.textContent = msg
  el.hidden = false
  clearTimeout(toast._t)
  toast._t = setTimeout(function () { el.hidden = true }, 2400)
}

function setAuthMsg(msg) {
  var el = $('auth-msg')
  if (!el) return
  if (!msg) { el.hidden = true; el.textContent = ''; return }
  el.textContent = msg
  el.hidden = false
}

function prettyAuthError(msg) {
  var x = String(msg || '')
  if (!x) return 'Erro ao autenticar.'
  if (/invalid login|invalid email or password/i.test(x)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed|not confirmed/i.test(x)) return 'E-mail não confirmado. Verifique sua caixa de entrada/spam (ou desative confirmação por e-mail no Supabase).'
  if (/rate limit|too many requests|429/i.test(x)) return 'Muitas tentativas. Aguarde um pouco e tente novamente.'
  if (/fetch failed|network|failed to fetch/i.test(x)) return 'Falha de rede. Verifique sua internet ou bloqueio do navegador.'
  return x
}

function parseBRL(input) {
  var s = String(input || '').trim()
  if (!s) return 0
  s = s.replace(/[R$\s]/g, '')
  if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.indexOf(',') >= 0) s = s.replace(',', '.')
  var n = parseFloat(s)
  return isFinite(n) ? n : NaN
}

function categoryLabel(c) {
  if (c === 'peca') return 'Peça'
  if (c === 'periferico') return 'Periférico'
  if (c === 'servico') return 'Serviço'
  return 'Outros'
}

function isHttpUrl(s) {
  return /^https?:\/\//i.test(String(s || ''))
}

function makeId() {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID()
  } catch (_) {}
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function sanitizeFilename(name) {
  return String(name || 'foto')
    .replace(/[^\w.\-]+/g, '_')
    .slice(0, 80)
}

function showAuth(show) {
  var el = $('auth')
  if (el) el.hidden = !show
}

function setSessionUI(email) {
  var se = $('session-email')
  var lo = $('btn-logout')
  if (se) se.textContent = email ? ('Logado: ' + email) : ''
  if (lo) lo.hidden = !email
}

function ensureSupabaseLoaded() {
  try {
    return window.supabase && typeof window.supabase.createClient === 'function'
  } catch (_) {
    return false
  }
}

var sb = null
var user = null
var items = []
var editingId = null
var signedUrlCache = {} // key: path -> { url, expMs }

function totals() {
  var total = 0
  for (var i = 0; i < items.length; i++) total += Number(items[i].price || 0)
  return { total: total, count: items.length }
}

function updateSummary() {
  var t = totals()
  var v = $('sum-total')
  var c = $('sum-count')
  if (v) v.textContent = fmt(t.total)
  if (c) c.textContent = String(t.count)
}

function currentFilter() {
  var f = $('filter')
  return (f && f.value) || 'todos'
}

function currentSearch() {
  var s = $('search')
  return ((s && s.value) || '').trim().toLowerCase()
}

function visibleItems() {
  var f = currentFilter()
  var q = currentSearch()
  return items.filter(function (it) {
    if (f !== 'todos' && it.category !== f) return false
    if (!q) return true
    var hay = (it.name + ' ' + (it.notes || '')).toLowerCase()
    return hay.indexOf(q) >= 0
  })
}

function render() {
  updateSummary()
  var ul = $('list')
  var empty = $('empty')
  if (!ul || !empty) return

  var rows = visibleItems()
  ul.innerHTML = ''
  empty.hidden = rows.length > 0

  rows.forEach(function (it) {
    var li = document.createElement('li')
    li.className = 'item'

    var imgWrap = document.createElement('div')
    imgWrap.className = 'item__img'
    var photo = it.photo_url || it.image_path || ''
    if (photo) {
      var img = document.createElement('img')
      img.loading = 'lazy'
      img.alt = it.name || 'Foto'
      img.src = photo
      imgWrap.appendChild(img)
    } else {
      imgWrap.textContent = 'Sem foto'
    }

    var body = document.createElement('div')
    body.className = 'item__body'

    var badge = document.createElement('span')
    badge.className = 'badge badge--' + it.category
    badge.textContent = categoryLabel(it.category)

    var title = document.createElement('div')
    title.className = 'item__title'
    title.textContent = it.name

    var notes = document.createElement('div')
    notes.className = 'item__notes'
    notes.textContent = it.notes || ''

    var price = document.createElement('div')
    price.className = 'item__price'
    price.textContent = fmt(it.price)

    var footer = document.createElement('div')
    footer.className = 'item__footer'

    var btnEdit = document.createElement('button')
    btnEdit.type = 'button'
    btnEdit.className = 'btn btn--ghost'
    btnEdit.textContent = 'Editar'
    btnEdit.setAttribute('data-edit', it.id)

    var btnDel = document.createElement('button')
    btnDel.type = 'button'
    btnDel.className = 'btn btn--danger'
    btnDel.textContent = 'Excluir'
    btnDel.setAttribute('data-del', it.id)

    footer.appendChild(btnEdit)
    footer.appendChild(btnDel)

    body.appendChild(badge)
    body.appendChild(title)
    body.appendChild(notes)
    body.appendChild(price)
    body.appendChild(footer)

    li.appendChild(imgWrap)
    li.appendChild(body)
    ul.appendChild(li)
  })
}

function resetForm() {
  editingId = null
  var saveBtn = $('btn-save')
  if (saveBtn) saveBtn.textContent = 'Adicionar'
  var cancelBtn = $('btn-cancel')
  if (cancelBtn) cancelBtn.hidden = true
  var form = $('form-item')
  if (form) form.reset()
  var u = $('item-photo-url')
  if (u) u.value = ''
}

function setEditing(it) {
  editingId = it.id
  $('btn-save').textContent = 'Salvar'
  $('btn-cancel').hidden = false
  $('item-category').value = it.category
  $('item-name').value = it.name
  $('item-notes').value = it.notes || ''
  $('item-price').value = String(it.price || 0).replace('.', ',')
  $('item-photo-url').value = isHttpUrl(it.image_path) ? it.image_path : ''
  toast('Editando item.')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cacheSignedUrl(path, url) {
  signedUrlCache[path] = { url: url, expMs: Date.now() + (SIGNED_URL_TTL_SECONDS * 1000) - 30_000 }
}

function getCachedSignedUrl(path) {
  var c = signedUrlCache[path]
  if (!c) return ''
  if (Date.now() > c.expMs) return ''
  return c.url
}

function signUrlIfNeeded(path) {
  if (!path) return Promise.resolve('')
  if (isHttpUrl(path)) return Promise.resolve(path)
  var cached = getCachedSignedUrl(path)
  if (cached) return Promise.resolve(cached)
  return sb.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS).then(function (res) {
    if (res.error) {
      console.warn('[NT] signed url erro:', res.error.message)
      return ''
    }
    var url = res.data ? res.data.signedUrl : ''
    if (url) cacheSignedUrl(path, url)
    return url
  })
}

function loadItems() {
  if (!user) return Promise.resolve(false)
  return sb.from('pc_items')
    .select('id, category, name, notes, price, image_path, created_at')
    .order('created_at', { ascending: false })
    .then(function (res) {
      if (res.error) {
        console.error('[NT] loadItems erro:', res.error.message)
        toast('Erro ao carregar itens.')
        items = []
        render()
        return false
      }
      items = (res.data || []).map(function (r) {
        return {
          id: r.id,
          category: r.category,
          name: r.name,
          notes: r.notes || '',
          price: Number(r.price || 0),
          image_path: r.image_path || '',
          photo_url: '',
          created_at: r.created_at
        }
      })
      // gerar URLs assinadas (só para imagens do bucket)
      return Promise.all(items.map(function (it) {
        if (!it.image_path || isHttpUrl(it.image_path)) return Promise.resolve('')
        return signUrlIfNeeded(it.image_path).then(function (u) { it.photo_url = u; return u })
      })).then(function () {
        render()
        return true
      })
    })
}

function uploadImage(file, itemId) {
  if (!file) return Promise.resolve('')
  if (!user) return Promise.resolve('')
  var path = user.id + '/' + itemId + '/' + Date.now() + '_' + sanitizeFilename(file.name)
  return sb.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type || undefined }).then(function (res) {
    if (res.error) {
      console.error('[NT] upload erro:', res.error.message)
      throw res.error
    }
    return path
  })
}

function upsertDbItem(payload) {
  if (!user) return Promise.resolve()

  if (editingId) {
    return sb.from('pc_items').update({
      category: payload.category,
      name: payload.name,
      notes: payload.notes,
      price: payload.price,
      image_path: payload.image_path
    }).eq('id', editingId).then(function (res) {
      if (res.error) throw res.error
      toast('Item atualizado.')
      resetForm()
      return loadItems()
    }).catch(function (err) {
      console.error(err)
      toast('Erro ao atualizar.')
    })
  }

  return sb.from('pc_items').insert({
    id: payload.id,
    user_id: user.id,
    category: payload.category,
    name: payload.name,
    notes: payload.notes,
    price: payload.price,
    image_path: payload.image_path
  }).then(function (res) {
    if (res.error) throw res.error
    toast('Item adicionado.')
    resetForm()
    return loadItems()
  }).catch(function (err) {
    console.error(err)
    toast('Erro ao salvar.')
  })
}

function deleteItem(id) {
  if (!confirm('Excluir este item?')) return
  var it = null
  for (var i = 0; i < items.length; i++) if (items[i].id === id) { it = items[i]; break }
  sb.from('pc_items').delete().eq('id', id).then(function (res) {
    if (res.error) { toast('Erro ao excluir.'); return }
    // tenta remover imagem do bucket (se for path)
    if (it && it.image_path && !isHttpUrl(it.image_path)) {
      sb.storage.from(BUCKET).remove([it.image_path]).catch(function () {})
    }
    toast('Item removido.')
    loadItems()
  })
}

function exportJSON() {
  var data = JSON.stringify({ items: items.map(function (it) {
    return {
      category: it.category,
      name: it.name,
      notes: it.notes,
      price: it.price,
      image_path: it.image_path
    }
  }) }, null, 2)
  var blob = new Blob([data], { type: 'application/json' })
  var url = URL.createObjectURL(blob)
  var a = document.createElement('a')
  a.href = url
  a.download = 'neyfel-tech-monte-seu-pc.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function importJSONFile(file) {
  var fr = new FileReader()
  fr.onerror = function () { toast('Falha ao importar.') }
  fr.onload = function () {
    var data = safeParseJSON(String(fr.result || ''))
    if (!data || !Array.isArray(data.items)) { toast('Arquivo inválido.'); return }

    // importa como novos itens (sem reusar ids)
    var rows = data.items.map(function (it) {
      return {
        id: makeId(),
        user_id: user.id,
        category: it.category || 'peca',
        name: it.name || '',
        notes: it.notes || '',
        price: Number(it.price || 0),
        image_path: it.image_path || ''
      }
    }).filter(function (x) { return x.name })

    if (!rows.length) { toast('Nada para importar.'); return }
    sb.from('pc_items').insert(rows).then(function (res) {
      if (res.error) { toast('Erro ao importar.'); return }
      toast('Importado.')
      loadItems()
    })
  }
  fr.readAsText(file)
}

function wireUI() {
  var authMode = 'login'
  function setMode(m) {
    authMode = (m === 'register') ? 'register' : 'login'
    document.querySelectorAll('[data-auth-mode]').forEach(function (b) {
      b.classList.toggle('auth__tab--on', b.getAttribute('data-auth-mode') === authMode)
    })
    var prim = $('btn-auth-primary')
    if (prim) prim.textContent = authMode === 'register' ? 'Criar conta' : 'Entrar'
    var help = $('auth-help')
    if (help) help.textContent = authMode === 'register'
      ? 'Crie sua conta com e-mail e senha (mín. 6 caracteres).'
      : 'Use seu e-mail e senha para entrar.'
    setAuthMsg('')
  }

  // Auth
  var authForm = $('auth-form')
  if (authForm) authForm.onsubmit = function (e) {
    e.preventDefault()
    setAuthMsg('')
    var email = ($('auth-email').value || '').trim()
    var pass = $('auth-pass').value || ''
    if (!email || pass.length < 6) { setAuthMsg('Preencha e-mail e senha (mín. 6).'); return }
    var prim = $('btn-auth-primary')
    prim.disabled = true
    var p = null
    if (authMode === 'register') {
      p = sb.auth.signUp({ email: email, password: pass }).then(function (res) {
        if (res.error) { setAuthMsg(prettyAuthError(res.error.message)); return }
        setMode('login')
        setAuthMsg('Conta criada. Agora você pode entrar.')
      })
    } else {
      p = sb.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
        if (res.error) { setAuthMsg(prettyAuthError(res.error.message)); return }
        // onAuthStateChange cuida do resto
      })
    }
    Promise.resolve(p).finally(function () { prim.disabled = false })
  }

  document.querySelectorAll('[data-auth-mode]').forEach(function (b) {
    b.onclick = function () { setMode(b.getAttribute('data-auth-mode')) }
  })
  setMode('login')

  var showPass = $('auth-show-pass')
  if (showPass) showPass.onchange = function () {
    var p = $('auth-pass')
    if (p) p.type = showPass.checked ? 'text' : 'password'
  }

  var btnLogout = $('btn-logout')
  if (btnLogout) btnLogout.onclick = function () {
    sb.auth.signOut().catch(function () {})
  }

  // Form item
  var form = $('form-item')
  if (form) form.onsubmit = function (e) {
    e.preventDefault()
    if (!user) { toast('Entre para salvar.'); showAuth(true); return }

    var name = ($('item-name').value || '').trim()
    if (!name) { toast('Informe o nome.'); return }
    var price = parseBRL($('item-price').value)
    if (!isFinite(price) || price < 0) { toast('Preço inválido (ex.: 1999,90).'); return }

    var category = $('item-category').value || 'peca'
    var notes = ($('item-notes').value || '').trim()

    var url = ($('item-photo-url').value || '').trim()
    var file = ($('item-photo').files && $('item-photo').files[0]) ? $('item-photo').files[0] : null

    var id = editingId || makeId()

    $('btn-save').disabled = true

    var imagePromise = null
    if (file) imagePromise = uploadImage(file, id)
    else if (url) imagePromise = Promise.resolve(url)
    else if (editingId) {
      // em edição sem alterar, mantém image_path atual
      var cur = null
      for (var i = 0; i < items.length; i++) if (items[i].id === editingId) { cur = items[i]; break }
      imagePromise = Promise.resolve(cur ? (cur.image_path || '') : '')
    } else imagePromise = Promise.resolve('')

    Promise.resolve(imagePromise).then(function (image_path) {
      return upsertDbItem({
        id: id,
        category: category,
        name: name,
        notes: notes,
        price: price,
        image_path: image_path || ''
      })
    }).catch(function (err) {
      console.error(err)
      toast('Erro ao enviar imagem/salvar.')
    }).finally(function () {
      $('btn-save').disabled = false
    })
  }

  var cancel = $('btn-cancel')
  if (cancel) cancel.onclick = function () { resetForm(); toast('Edição cancelada.') }

  var list = $('list')
  if (list) list.onclick = function (e) {
    var t = e.target
    if (!t) return
    var did = t.getAttribute('data-del')
    if (did) { deleteItem(did); return }
    var eid = t.getAttribute('data-edit')
    if (eid) {
      var it = null
      for (var i = 0; i < items.length; i++) if (items[i].id === eid) { it = items[i]; break }
      if (it) setEditing(it)
    }
  }

  var search = $('search')
  if (search) search.oninput = function () { render() }
  var filter = $('filter')
  if (filter) filter.onchange = function () { render() }

  var exp = $('btn-export')
  if (exp) exp.onclick = function () { exportJSON() }
  var imp = $('import-file')
  if (imp) imp.onchange = function () {
    if (!user) { toast('Entre para importar.'); showAuth(true); imp.value = ''; return }
    var f = (imp.files && imp.files[0]) ? imp.files[0] : null
    if (f) importJSONFile(f)
    imp.value = ''
  }

  var clear = $('btn-clear')
  if (clear) clear.onclick = function () {
    if (!user) { toast('Entre para limpar.'); showAuth(true); return }
    if (!confirm('Limpar tudo? Isso apaga seus itens da sua conta.')) return
    sb.from('pc_items').delete().neq('id', '00000000-0000-0000-0000-000000000000').then(function (res) {
      if (res.error) { toast('Erro ao limpar.'); return }
      items = []
      toast('Itens apagados.')
      resetForm()
      render()
    })
  }
}

function boot() {
  if (!ensureSupabaseLoaded()) {
    toast('Supabase não carregou. Verifique a internet.')
    return
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || /SEU-PROJETO|SUA_ANON_KEY/i.test(SUPABASE_URL + SUPABASE_ANON_KEY)) {
    showAuth(true)
    setAuthMsg('Configuração do Supabase incompleta. Preencha SUPABASE_URL e SUPABASE_ANON_KEY no app.js.')
    return
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  wireUI()

  sb.auth.onAuthStateChange(function (_event, session) {
    user = session && session.user ? session.user : null
    setSessionUI(user ? user.email : '')
    showAuth(!user)
    if (user) loadItems()
    else { items = []; render() }
  })

  sb.auth.getSession().then(function (res) {
    var session = res.data ? res.data.session : null
    user = session && session.user ? session.user : null
    setSessionUI(user ? user.email : '')
    showAuth(!user)
    if (user) loadItems()
    else render()
  })
}

boot()

