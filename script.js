const canvas = document.getElementById('bg')
const ctx = canvas?.getContext('2d')

if (canvas && ctx) {
  let w = 0
  let h = 0
  let dpr = 1

  function rand(min, max) {
    return Math.random() * (max - min) + min
  }

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    w = Math.floor(window.innerWidth)
    h = Math.floor(window.innerHeight)
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  window.addEventListener('resize', resize, { passive: true })
  resize()

  function draw(tMs) {
    const t = tMs * 0.001

    ctx.clearRect(0, 0, w, h)

    // Glow mais forte: arco-iris mais “gritado”
    ctx.globalCompositeOperation = 'source-over'
    // Fundo RGB suave (neon fog), para substituir "faixas" de fundo
    const fogCount = 6
    for (let i = 0; i < fogCount; i++) {
      const hue = (t * 45 + i * 60) % 360
      const x = w * (0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * (0.22 + i * 0.02) + i)))
      const y = h * (0.2 + 0.6 * (0.5 + 0.5 * Math.cos(t * (0.18 + i * 0.02) + i * 2)))
      const r = Math.min(w, h) * (0.55 + i * 0.06)

      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `hsla(${hue}, 100%, 62%, 0.26)`)
      g.addColorStop(1, `hsla(${hue}, 100%, 62%, 0)`)

      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    // Sem arcos: apenas fundo RGB animado

    if (!prefersReducedMotion) {
      requestAnimationFrame(draw)
    }
  }

  requestAnimationFrame(draw)
}

