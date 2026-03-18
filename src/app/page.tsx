'use client'

import { useEffect, useMemo, useState } from 'react'

type Quote = { text: string; author: string }
type HistoryEntry = {
  id: string
  at: number
  color: string
  vibe: string
  number: number
  quote: Quote
}

const QUOTES: Quote[] = [
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'What you do every day matters more than what you do once in a while.', author: 'Gretchen Rubin' },
  { text: 'If it’s not a “hell yes”, it’s a no.', author: 'Unknown' },
  { text: 'Small steps, every day.', author: 'Unknown' },
  { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca' },
  { text: 'Focus is saying no to good ideas.', author: 'Steve Jobs' },
]

const VIBES = [
  'cozy',
  'electric',
  'clean',
  'bold',
  'minimal',
  'chaotic good',
  'retro-future',
  'midnight',
  'sun-drenched',
  'neon noir',
  'soft power',
  'high contrast',
  'playful',
  'serene',
]

function randomInt(minInclusive: number, maxInclusive: number) {
  const min = Math.ceil(minInclusive)
  const max = Math.floor(maxInclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function randomHexColor() {
  const n = Math.floor(Math.random() * 0xffffff)
  return `#${n.toString(16).padStart(6, '0')}`.toUpperCase()
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  const r = Number.parseInt(clean.slice(0, 2), 16)
  const g = Number.parseInt(clean.slice(2, 4), 16)
  const b = Number.parseInt(clean.slice(4, 6), 16)
  return { r, g, b }
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const toLinear = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const R = toLinear(r)
  const G = toLinear(g)
  const B = toLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function pickReadableTextColor(bgHex: string) {
  const L = relativeLuminance(hexToRgb(bgHex))
  return L > 0.45 ? '#0B0B10' : '#F7F7FB'
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const STORAGE_KEY = 'storedp.random-studio.history.v1'

export default function Page() {
  const [color, setColor] = useState(() => randomHexColor())
  const [vibe, setVibe] = useState(() => randomItem(VIBES))
  const [number, setNumber] = useState(() => randomInt(1, 9999))
  const [quote, setQuote] = useState<Quote>(() => randomItem(QUOTES))
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const textOnColor = useMemo(() => pickReadableTextColor(color), [color])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as HistoryEntry[]
      if (Array.isArray(parsed)) setHistory(parsed.slice(0, 12))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 12)))
    } catch {
      // ignore
    }
  }, [history])

  function rollAll() {
    setColor(randomHexColor())
    setVibe(randomItem(VIBES))
    setNumber(randomInt(1, 9999))
    setQuote(randomItem(QUOTES))
  }

  function saveToHistory() {
    const entry: HistoryEntry = {
      id: makeId(),
      at: Date.now(),
      color,
      vibe,
      number,
      quote,
    }
    setHistory((h) => [entry, ...h].slice(0, 12))
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', 'true')
      el.style.position = 'fixed'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="kicker">Next.js • React</div>
          <h1>Random Studio</h1>
          <p className="subtitle">
            Um site aleatório para gerar cor, frase, número e “vibe”. Salve seus favoritos e copie
            com um clique.
          </p>
        </div>
        <div className="headerActions">
          <button className="btn btnPrimary" onClick={rollAll}>
            Surprise me
          </button>
          <button className="btn" onClick={saveToHistory}>
            Salvar
          </button>
        </div>
      </header>

      <main className="grid">
        <section className="card colorCard" style={{ background: color, color: textOnColor }}>
          <div className="cardTop">
            <h2>Cor</h2>
            <div className="pill" style={{ borderColor: 'rgba(255,255,255,0.28)' }}>
              {color}
            </div>
          </div>
          <div className="bigValue">{color}</div>
          <div className="row">
            <button className="btn btnOnColor" onClick={() => setColor(randomHexColor())}>
              Gerar cor
            </button>
            <button className="btn btnOnColor" onClick={() => void copy(color)}>
              Copiar
            </button>
          </div>
        </section>

        <section className="card">
          <div className="cardTop">
            <h2>Frase</h2>
            <button className="chip" onClick={() => setQuote(randomItem(QUOTES))}>
              Trocar
            </button>
          </div>
          <blockquote className="quote">
            “{quote.text}”
            <footer>— {quote.author}</footer>
          </blockquote>
          <div className="row">
            <button className="btn" onClick={() => void copy(`${quote.text} — ${quote.author}`)}>
              Copiar
            </button>
          </div>
        </section>

        <section className="card">
          <div className="cardTop">
            <h2>Vibe</h2>
            <button className="chip" onClick={() => setVibe(randomItem(VIBES))}>
              Trocar
            </button>
          </div>
          <div className="bigValue vibe">{vibe}</div>
          <div className="row">
            <button className="btn" onClick={() => void copy(vibe)}>
              Copiar
            </button>
          </div>
        </section>

        <section className="card">
          <div className="cardTop">
            <h2>Número</h2>
            <button className="chip" onClick={() => setNumber(randomInt(1, 9999))}>
              Trocar
            </button>
          </div>
          <div className="bigValue number">{number}</div>
          <div className="row">
            <button className="btn" onClick={() => void copy(String(number))}>
              Copiar
            </button>
          </div>
        </section>

        <section className="card history">
          <div className="cardTop">
            <h2>Histórico</h2>
            <button className="chip" onClick={() => setHistory([])} disabled={history.length === 0}>
              Limpar
            </button>
          </div>

          {history.length === 0 ? (
            <p className="muted">
              Clique em <strong>Salvar</strong> para guardar combinações aqui (fica salvo no seu
              navegador).
            </p>
          ) : (
            <ul className="historyList">
              {history.map((h) => (
                <li key={h.id} className="historyItem">
                  <button
                    className="historySwatch"
                    style={{ background: h.color }}
                    aria-label={`Usar cor ${h.color}`}
                    onClick={() => {
                      setColor(h.color)
                      setVibe(h.vibe)
                      setNumber(h.number)
                      setQuote(h.quote)
                    }}
                  />
                  <div className="historyMeta">
                    <div className="historyLine">
                      <span className="mono">{h.color}</span>
                      <span className="dot">•</span>
                      <span className="mono">{h.number}</span>
                      <span className="dot">•</span>
                      <span>{h.vibe}</span>
                    </div>
                    <div className="historySub">“{h.quote.text}”</div>
                  </div>
                  <div className="historyActions">
                    <button className="chip" onClick={() => void copy(h.color)}>
                      Copiar cor
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>
          Dica: aperte <span className="kbd">Surprise me</span> e depois{' '}
          <span className="kbd">Salvar</span>.
        </span>
      </footer>
    </div>
  )
}

