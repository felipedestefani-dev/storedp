export default function Page() {
  const phone = '5519989599014'

  const waLink = (model: string) => {
    const text = encodeURIComponent(
      `Olá! Quero comprar um site (modelo: ${model}). Meu nome é: `
    )
    return `https://wa.me/${phone}?text=${text}`
  }

  const models = [
    {
      id: 'barbearia',
      title: 'Barbearia / Salão',
      tag: 'Serviço',
      desc: 'Agendamento + galeria + WhatsApp',
      highlights: ['Home + Serviços', 'Galeria', 'Botão WhatsApp'],
    },
    {
      id: 'clinica',
      title: 'Clínica / Estética',
      tag: 'Profissional',
      desc: 'Autoridade e conversão',
      highlights: ['Sobre', 'Procedimentos', 'Depoimentos'],
    },
    {
      id: 'mecanica',
      title: 'Mecânica / Auto',
      tag: 'Local',
      desc: 'Orçamento rápido no WhatsApp',
      highlights: ['Serviços', 'Mapa', 'CTA fixo'],
    },
    {
      id: 'restaurante',
      title: 'Restaurante / Pizzaria',
      tag: 'Cardápio',
      desc: 'Menu com botão “Pedir agora”',
      highlights: ['Cardápio', 'Horários', 'Pedido via WhatsApp'],
    },
    {
      id: 'imobiliaria',
      title: 'Imobiliária',
      tag: 'Vitrine',
      desc: 'Destaques + contato rápido',
      highlights: ['Cards de imóveis', 'Filtros', 'WhatsApp'],
    },
    {
      id: 'loja',
      title: 'Loja / Catálogo',
      tag: 'Produtos',
      desc: 'Vitrine de produtos com CTA',
      highlights: ['Categorias', 'Produtos', 'Comprar no WhatsApp'],
    },
    {
      id: 'portfolio',
      title: 'Portfólio',
      tag: 'Pessoal',
      desc: 'Perfeito para freelancer',
      highlights: ['Projetos', 'Sobre', 'Contato'],
    },
    {
      id: 'evento',
      title: 'Eventos',
      tag: 'Landing',
      desc: 'Inscrição e informações',
      highlights: ['Programação', 'Local', 'Ingresso/WhatsApp'],
    },
  ] as const

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="kicker">Vitrine de modelos</div>
          <h1>Escolha um modelo e compre no WhatsApp</h1>
          <p className="subtitle">
            Aqui estão alguns estilos de site para você escolher. Todos têm botão de WhatsApp e
            ficam responsivos (celular/PC). Clique em <strong>Comprar agora</strong> no modelo que
            você gostou.
          </p>
        </div>
        <div className="headerActions">
          <a className="btn btnPrimary" href={waLink('Quero escolher um modelo')} target="_blank" rel="noreferrer">
            Comprar agora
          </a>
          <a className="btn" href="#modelos">
            Ver modelos
          </a>
        </div>
      </header>

      <main className="grid">
        <section className="card heroCard">
          <div className="cardTop">
            <h2>Como funciona</h2>
            <span className="pill">Simples</span>
          </div>
          <ul className="list">
            <li>Você escolhe um modelo (abaixo)</li>
            <li>Me chama no WhatsApp e manda seu nome + tipo de negócio</li>
            <li>Eu personalizo com suas cores, logo, textos e links</li>
            <li>Eu publico na Vercel e te entrego o link</li>
          </ul>
          <div className="row">
            <a className="btn btnPrimary" href={waLink('Quero um site (meu modelo é...)')} target="_blank" rel="noreferrer">
              Comprar agora
            </a>
            <a className="btn" href="#modelos">
              Ver modelos
            </a>
          </div>
        </section>

        <section className="card">
          <div className="cardTop">
            <h2>Entrega</h2>
            <span className="pill">Rápido</span>
          </div>
          <div className="bigValue">Feito para vender</div>
          <p className="muted">
            Todos os modelos têm foco em conversão: botões de WhatsApp, seção de serviços/produtos,
            prova social (depoimentos) e contato claro.
          </p>
        </section>

        <section id="modelos" className="card showcase">
          <div className="cardTop">
            <h2>Modelos (amostras)</h2>
            <span className="pill">Escolha 1</span>
          </div>
          <div className="showcaseGrid">
            {models.map((m, idx) => (
              <article key={m.id} className="modelCard">
                <div className={`modelThumb thumb${(idx % 6) + 1}`} aria-hidden="true" />
                <div className="modelBody">
                  <div className="modelTop">
                    <div>
                      <div className="modelTag">{m.tag}</div>
                      <div className="modelTitle">{m.title}</div>
                      <div className="modelDesc">{m.desc}</div>
                    </div>
                  </div>
                  <ul className="modelHighlights">
                    {m.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <div className="row">
                    <a className="btn btnPrimary" href={waLink(m.title)} target="_blank" rel="noreferrer">
                      Comprar agora
                    </a>
                    <a className="btn" href={waLink(`${m.title} (quero detalhes)`)} target="_blank" rel="noreferrer">
                      Pedir detalhes
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card faq">
          <div className="cardTop">
            <h2>Dúvidas rápidas</h2>
            <span className="pill">FAQ</span>
          </div>
          <div className="faqGrid">
            <div className="faqItem">
              <div className="faqQ">Quanto tempo demora?</div>
              <div className="faqA">Depende do modelo e do conteúdo, mas costuma ser rápido.</div>
            </div>
            <div className="faqItem">
              <div className="faqQ">Preciso ter domínio?</div>
              <div className="faqA">Não. Você pode comprar depois; eu publico na Vercel primeiro.</div>
            </div>
            <div className="faqItem">
              <div className="faqQ">Consigo mudar textos e fotos?</div>
              <div className="faqA">Sim — você me envia e eu ajusto tudo no seu modelo.</div>
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

