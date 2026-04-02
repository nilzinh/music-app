'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      alert('Preencha email e senha.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleRegister() {
    if (!email.trim() || !password.trim()) {
      alert('Preencha email e senha.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    alert('Conta criada com sucesso! Agora faça login.')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-sm shadow-lg">
        <h1 className="text-2xl mb-6 font-bold text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded bg-zinc-800 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-4 p-3 rounded bg-zinc-800 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded mb-2"
        >
          Entrar
        </button>

        <button
          onClick={handleRegister}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded"
        >
          Criar conta
        </button>
      </div>
    </main>
  )
}