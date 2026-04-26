'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 1600)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="text-center animate-pulse">
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-green-500 text-5xl font-black text-black shadow-2xl shadow-green-500/30">
          NM
        </div>

        <h1 className="text-4xl font-black text-white">
          Nil&apos;s <span className="text-green-500">Music</span>
        </h1>

        <p className="mt-3 text-sm tracking-[0.3em] text-zinc-500">
          ONLINE PLAYER
        </p>

        <div className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-green-500" />
        </div>
      </div>
    </div>
  )
}