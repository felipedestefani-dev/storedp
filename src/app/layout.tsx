import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Random Studio',
  description: 'Um site aleatório feito com Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

