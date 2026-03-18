import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="page">
      <div className="card heroCard">
        <div className="cardTop">
          <h2>Página não encontrada</h2>
          <span className="pill">404</span>
        </div>
        <p className="muted">Esse endereço não existe. Volte para a página inicial.</p>
        <div className="row" style={{ marginTop: 14 }}>
          <Link className="btn btnPrimary" href="/">
            Ir para a loja
          </Link>
        </div>
      </div>
    </div>
  )
}

