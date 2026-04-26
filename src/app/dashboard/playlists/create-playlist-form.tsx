'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  userId: string
}

export default function CreatePlaylistForm({ userId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      alert('Digite um nome para a playlist.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.from('playlists').insert({
        user_id: userId,
        name: name.trim(),
      })

      if (error) {
        alert(error.message)
        return
      }

      setName('')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao criar playlist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleCreate}
      className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6"
    >
      <h2 className="text-2xl font-bold mb-4">Criar playlist</h2>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Nome da playlist"
          className="flex-1 p-4 rounded-2xl bg-zinc-950 text-white outline-none border border-zinc-800 placeholder:text-zinc-500 focus:border-green-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-6 py-4 rounded-full font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar'}
        </button>
      </div>
    </form>
  )
}