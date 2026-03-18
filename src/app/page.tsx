export default function Page() {
  const phone = '5519989599014'

  const waLink = (plan: string) => {
    const text = encodeURIComponent(
      `Olá! Quero comprar um site (${plan}). Meu nome é: `
    )
    return `https://wa.me/${phone}?text=${text}`
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="kicker">Sites • Landing Pages • Loja</div>
          <h1>Seu site no ar em poucos dias</h1>
          <p className="subtitle">
            Eu crio sites rápidos, bonitos e responsivos para você vender mais. Clique em{' '}
            <strong>Comprar agora</strong> e fale comigo no WhatsApp.
          </p>
        </div>
        <div className="headerActions">
          <a className="btn btnPrimary" href={waLink('Orçamento rápido')} target="_blank" rel="noreferrer">
            Comprar agora
          </a>
          <a className="btn" href="#planos">
            Ver planos
          </a>
        </div>
      </header>

      <main className="grid">
        <section className="card heroCard">
          <div className="cardTop">
            <h2>O que você recebe</h2>
            <span className="pill">Entrega rápida</span>
          </div>
          <ul className="list">
            <li>Design moderno e responsivo (celular, tablet e PC)</li>
            <li>Site rápido (Next.js) e otimizado para SEO básico</li>
            <li>Botões de WhatsApp/Instagram e formulário de contato</li>
            <li>Hospedagem na Vercel e domínio configurado (se você já tiver)</li>
          </ul>
          <div className="row">
            <a className="btn btnPrimary" href={waLink('Orçamento rápido')} target="_blank" rel="noreferrer">
              Comprar agora
            </a>
            <a className="btn" href="#portfolio">
              Ver exemplos
            </a>
          </div>
        </section>

        <section className="card">
          <div className="cardTop">
            <h2>Perfeito para</h2>
            <span className="pill">Negócios locais</span>
          </div>
          <div className="bigValue">Converter visitas em clientes</div>
          <p className="muted">
            Ideal para barbearia, estética, mecânica, loja, prestadores de serviço, eventos e
            qualquer negócio que precisa de presença online profissional.
          </p>
        </section>

        <section id="portfolio" className="card">
          <div className="cardTop">
            <h2>Portfólio</h2>
            <span className="pill">Exemplos</span>
          </div>
          <div className="portfolioGrid">
            <div className="miniCard">
              <div className="miniTitle">Landing Page</div>
              <div className="miniDesc">Serviço + CTA WhatsApp</div>
            </div>
            <div className="miniCard">
              <div className="miniTitle">Site Institucional</div>
              <div className="miniDesc">Sobre, serviços, contato</div>
            </div>
            <div className="miniCard">
              <div className="miniTitle">Cardápio / Catálogo</div>
              <div className="miniDesc">Itens e links de pedido</div>
            </div>
          </div>
          <p className="muted">
            Quer algo específico? Me chama no WhatsApp que eu te mostro modelos e ideias.
          </p>
        </section>

        <section id="planos" className="card plans">
          <div className="cardTop">
            <h2>Planos</h2>
            <span className="pill">Compre agora</span>
          </div>

          <div className="plansGrid">
            <div className="plan">
              <div className="planName">Starter</div>
              <div className="planPrice">Site de 1 página</div>
              <ul className="list">
                <li>Seções: hero, benefícios, serviços, contato</li>
                <li>Botão WhatsApp + redes sociais</li>
                <li>Deploy na Vercel</li>
              </ul>
              <a className="btn btnPrimary" href={waLink('Starter')} target="_blank" rel="noreferrer">
                Comprar agora
              </a>
            </div>

            <div className="plan planFeatured">
              <div className="planName">Pro</div>
              <div className="planPrice">Site completo</div>
              <ul className="list">
                <li>Até 5 páginas (Home, Sobre, Serviços, Portfólio, Contato)</li>
                <li>SEO básico + performance</li>
                <li>Formulário de contato</li>
              </ul>
              <a className="btn btnPrimary" href={waLink('Pro')} target="_blank" rel="noreferrer">
                Comprar agora
              </a>
            </div>

            <div className="plan">
              <div className="planName">Loja / Catálogo</div>
              <div className="planPrice">Vitrine de produtos</div>
              <ul className="list">
                <li>Catálogo com categorias</li>
                <li>Botão “comprar” para WhatsApp</li>
                <li>Integração com links de pagamento (opcional)</li>
              </ul>
              <a className="btn btnPrimary" href={waLink('Loja / Catálogo')} target="_blank" rel="noreferrer">
                Comprar agora
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>
          WhatsApp: <span className="kbd">(19) 98959-9014</span>
        </span>
        <a className="chip" href={waLink('Dúvidas')} target="_blank" rel="noreferrer">
          Falar agora
        </a>
      </footer>
    </div>
  )
}

