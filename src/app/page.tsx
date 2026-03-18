export default function Page() {
  const phone = '5519989599014'

  const waLink = (model: string) => {
    const text = encodeURIComponent(
      `Olá! Quero comprar um site (modelo: ${model}). Meu nome é: `
    )
    return `https://wa.me/${phone}?text=${text}`
  }

  const products = [
    {
      id: 'barbearia',
      title: 'Modelo Barbearia',
      category: 'Serviços',
      desc: 'Agendamento, galeria e CTA no WhatsApp',
      priceFrom: 299,
      features: ['Página inicial', 'Serviços', 'WhatsApp fixo'],
    },
    {
      id: 'clinica',
      title: 'Modelo Clínica/Estética',
      category: 'Profissionais',
      desc: 'Autoridade, depoimentos e conversão',
      priceFrom: 399,
      features: ['Sobre', 'Procedimentos', 'Depoimentos'],
    },
    {
      id: 'mecanica',
      title: 'Modelo Mecânica/Auto',
      category: 'Serviços',
      desc: 'Orçamento rápido com botão direto',
      priceFrom: 349,
      features: ['Serviços', 'Mapa', 'CTA fixo'],
    },
    {
      id: 'restaurante',
      title: 'Modelo Restaurante',
      category: 'Cardápio',
      desc: 'Cardápio e botão “Pedir agora”',
      priceFrom: 449,
      features: ['Cardápio', 'Horários', 'Pedido no WhatsApp'],
    },
    {
      id: 'imobiliaria',
      title: 'Modelo Imobiliária',
      category: 'Vitrine',
      desc: 'Destaques, filtros e contato rápido',
      priceFrom: 549,
      features: ['Cards', 'Filtros', 'WhatsApp'],
    },
    {
      id: 'loja',
      title: 'Modelo Loja/Catálogo',
      category: 'Produtos',
      desc: 'Vitrine com categorias e CTA',
      priceFrom: 599,
      features: ['Categorias', 'Produtos', 'Comprar no WhatsApp'],
    },
    {
      id: 'portfolio',
      title: 'Modelo Portfólio',
      category: 'Pessoal',
      desc: 'Para freelancer e profissional liberal',
      priceFrom: 249,
      features: ['Projetos', 'Sobre', 'Contato'],
    },
    {
      id: 'evento',
      title: 'Modelo Eventos',
      category: 'Landing',
      desc: 'Inscrição, programação e informações',
      priceFrom: 299,
      features: ['Programação', 'Local', 'Ingresso/WhatsApp'],
    },
  ] as const

  const categories = ['Todos', 'Serviços', 'Profissionais', 'Produtos', 'Cardápio', 'Vitrine', 'Pessoal', 'Landing'] as const

  return (
    <div className="shop">
      <header className="shopHeader">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <div className="brandName">Storedp Sites</div>
            <div className="brandSub">Modelos prontos • Personalização • WhatsApp</div>
          </div>
        </div>

        <div className="shopSearch" role="search" aria-label="Buscar modelos">
          <input className="searchInput" placeholder="Buscar modelo (ex: loja, clínica, barbearia)..." />
          <a className="btn btnPrimary" href={waLink('Quero comprar um site')} target="_blank" rel="noreferrer">
            Comprar no WhatsApp
          </a>
        </div>
      </header>

      <main className="shopMain">
        <aside className="filters" aria-label="Categorias">
          <div className="filtersTitle">Categorias</div>
          <div className="filtersList">
            {categories.map((c) => (
              <a key={c} className="filterPill" href="#produtos">
                {c}
              </a>
            ))}
          </div>

          <div className="filtersTitle">Entrega</div>
          <div className="filtersNote">
            Escolheu o modelo? Eu personalizo com seu logo, cores e textos e publico na Vercel.
          </div>
        </aside>

        <section id="produtos" className="products">
          <div className="productsTop">
            <div>
              <h1 className="shopTitle">Vitrine de modelos</h1>
              <p className="subtitle">
                Escolha um “produto” (modelo de site) e finalize direto no WhatsApp.
              </p>
            </div>
            <div className="badgeRow">
              <span className="badge">Pagamento via WhatsApp</span>
              <span className="badge">Entrega rápida</span>
              <span className="badge">Mobile first</span>
            </div>
          </div>

          <div className="productGrid">
            {products.map((p, idx) => (
              <article key={p.id} className="productCard">
                <div className={`productThumb thumb${(idx % 6) + 1}`} aria-hidden="true" />
                <div className="productBody">
                  <div className="productMeta">
                    <span className="productCategory">{p.category}</span>
                    <span className="productRating" aria-label="Avaliação 5 estrelas">
                      ★★★★★
                    </span>
                  </div>
                  <div className="productTitle">{p.title}</div>
                  <div className="productDesc">{p.desc}</div>

                  <div className="productPrice">
                    <span className="priceFrom">a partir de</span>
                    <span className="priceValue">R$ {p.priceFrom}</span>
                  </div>

                  <ul className="productFeatures">
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>

                  <div className="row">
                    <a className="btn btnPrimary" href={waLink(p.title)} target="_blank" rel="noreferrer">
                      Comprar agora
                    </a>
                    <a className="btn" href={waLink(`${p.title} (quero ver detalhes)`)} target="_blank" rel="noreferrer">
                      Ver detalhes
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="shopFooter">
        <span>
          WhatsApp: <span className="kbd">(19) 98959-9014</span>
        </span>
        <a className="chip" href={waLink('Quero um orçamento')} target="_blank" rel="noreferrer">
          Falar agora
        </a>
      </footer>
    </div>
  )
}

