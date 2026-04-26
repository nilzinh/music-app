import type { Metadata } from 'next'
import './globals.css'
import SWRegister from './sw-register'

export const metadata: Metadata = {
  title: 'Meu Music App',
  description: 'Seu app de música estilo Spotify',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SWRegister />
        {children}
      </body>
    </html>
  )
}