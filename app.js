const STORAGE_KEY = 'storedp-assignments'

let currentFilter = 'todos'
let assignments = []

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
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

function loadAssignments() {
  setBoardError('')
  assignments = loadFromStorage()
  assignments.sort((a, b) => {
    const ta = a.created_at || ''
    const tb = b.created_at || ''
    return tb.localeCompare(ta)
  })
  updateStats()
  renderList()
}

function toggleDone(a) {
  setBoardError('')
  const i = assignments.findIndex((x) => x.id === a.id)
  if (i === -1) return
  assignments[i] = { ...assignments[i], completed: !assignments[i].completed }
  saveToStorage()
  loadAssignments()
}

function removeItem(id) {
  if (!confirm('Remover este item?')) return
  setBoardError('')
  assignments = assignments.filter((x) => x.id !== id)
  saveToStorage()
  loadAssignments()
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function main() {
  loadAssignments()

  document.getElementById('form-add').addEventListener('submit', (e) => {
    e.preventDefault()
    setBoardError('')

    const title = document.getElementById('titulo').value.trim()
    if (!title) return

    const kind = document.getElementById('tipo').value
    const due = document.getElementById('entrega').value
    const notes = document.getElementById('obs').value.trim()

    const row = {
      id: newId(),
      title,
      notes,
      kind,
      due_date: due || null,
      completed: false,
      created_at: new Date().toISOString(),
    }

    try {
      assignments.unshift(row)
      saveToStorage()
    } catch (err) {
      setBoardError(
        err instanceof Error && err.name === 'QuotaExceededError'
          ? 'Armazenamento do navegador cheio. Libere espaço ou remova itens antigos.'
          : 'Não foi possível salvar.'
      )
      assignments = loadFromStorage()
      loadAssignments()
      return
    }

    document.getElementById('titulo').value = ''
    document.getElementById('entrega').value = ''
    document.getElementById('obs').value = ''
    document.getElementById('tipo').value = 'trabalho'
    loadAssignments()
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

main()
