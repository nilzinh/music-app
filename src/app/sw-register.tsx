'use client'

import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        console.log('Service Worker registrado')
      })
      .catch((error) => {
        console.error('Erro no Service Worker:', error)
      })
  }, [])

  return null
}