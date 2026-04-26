import type { Metadata } from 'next'
import './globals.css'
import SWRegister from './sw-register'

export const metadata: Metadata = {
  title: "Nil's Music",
  description: "Nil's Music - busque e ouça músicas online",
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