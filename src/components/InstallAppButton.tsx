'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  const [isInstalled, setIsInstalled] =
    useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia(
        '(display-mode: standalone)'
      ).matches

    const iosStandalone =
      'standalone' in navigator &&
      Boolean(
        (navigator as Navigator & {
          standalone?: boolean
        }).standalone
      )

    if (standalone || iosStandalone) {
      setIsInstalled(true)
    }

    function handleBeforeInstallPrompt(
      event: Event
    ) {
      event.preventDefault()

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      )
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    )

    window.addEventListener(
      'appinstalled',
      handleAppInstalled
    )

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )

      window.removeEventListener(
        'appinstalled',
        handleAppInstalled
      )
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) {
      alert(
        'Para instalar o Nil\'s Music, abra o menu do navegador e escolha "Instalar app" ou "Adicionar à tela inicial".'
      )
      return
    }

    await installPrompt.prompt()

    const choice =
      await installPrompt.userChoice

    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
    }

    setInstallPrompt(null)
  }

  if (isInstalled) {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 px-5 rounded-full"
    >
      📲 Instalar Nil&apos;s Music
    </button>
  )
}