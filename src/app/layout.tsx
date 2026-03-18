import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Criação de Sites | Comprar pelo WhatsApp',
  description: 'Vendo sites rápidos, bonitos e responsivos. Clique em comprar e fale no WhatsApp.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

