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
    } catch (error) {
      console.error(error)
      alert('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

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

      alert('Conta criada! Faça login.')
    } catch (error) {
      console.error(error)
      alert('Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <h1 className="text-2xl font-bold text-center mb-6">
          Nil's Music
        </h1>

        <form className="space-y-4">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-full bg-zinc-950 border border-zinc-800 outline-none focus:border-green-500"
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-full bg-zinc-950 border border-zinc-800 outline-none focus:border-green-500"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-full"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-full"
          >
            Criar conta
          </button>
        </form>
      </div>
    </div>
  )
}