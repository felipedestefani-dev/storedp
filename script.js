function initPrank() {
  const form = document.getElementById('prankForm')
  const modal = document.getElementById('modal')
  const modalImg = document.getElementById('modalImg')
  const modalClose = document.getElementById('modalClose')
  if (!form || !modal || !modalImg || !modalClose) return

  const PRANK_IMAGE_SRC = './WhatsApp%20Image%202026-03-18%20at%2012.19.15.jpeg'

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    // A zoeira é só visual. Não vamos enviar/usar dados reais.
    const nome = (document.getElementById('nome')?.value || '').trim()
    void nome

    modalImg.src = PRANK_IMAGE_SRC
    modal.classList.add('open')
    modal.setAttribute('aria-hidden', 'false')

    // Limpa o formulário pra não ficar dados preenchidos.
    form.reset()

  })

  modalClose.addEventListener('click', () => {
    modal.classList.remove('open')
    modal.setAttribute('aria-hidden', 'true')
  })

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open')
      modal.setAttribute('aria-hidden', 'true')
    }
  })
}

document.addEventListener('DOMContentLoaded', initPrank)

