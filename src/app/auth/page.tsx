'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      alert('Preencha email e senha.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    if (!email || !password) {
      alert('Preencha email e senha.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        return
      }

      alert('Conta criada! Agora faça login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.22),transparent_35%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-green-500 flex items-center justify-center text-5xl text-black font-black shadow-lg shadow-green-900/30">
            ♫
          </div>

          <h1 className="text-4xl font-black">Nil&apos;s Music</h1>
          <p className="text-zinc-400 mt-2">
            Busque, favorite e ouça músicas online.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            className="w-full p-4 rounded-full bg-zinc-900 border border-zinc-800 outline-none focus:border-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            className="w-full p-4 rounded-full bg-zinc-900 border border-zinc-800 outline-none focus:border-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black p-4 rounded-full font-bold transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 p-4 rounded-full font-semibold transition disabled:opacity-50"
        >
          Criar conta
        </button>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Nil&apos;s Music • Online Player
        </p>
      </div>
    </main>
  )
}