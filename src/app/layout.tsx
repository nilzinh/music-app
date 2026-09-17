import type { Metadata } from 'next'
import './globals.css'

import SWRegister from './sw-register'
import SplashScreen from './splash-screen'

import { PlayerProvider } from '@/contexts/PlayerContext'
import Player from '@/components/player/Player'
import YoutubeEngine from '@/components/player/YoutubeEngine'

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
        <PlayerProvider>
          <SWRegister />

          <SplashScreen />

          {children}

          <YoutubeEngine />

          <Player />
        </PlayerProvider>
      </body>
    </html>
  )
}