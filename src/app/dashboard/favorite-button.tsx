'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type FavoriteButtonProps = {
  songId: string
  userId: string
  isFavorite: boolean
}

export default function FavoriteButton({
  songId,
  userId,
  isFavorite,
}: FavoriteButtonProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggleFavorite() {
    try {
      setLoading(true)

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('song_id', songId)
          .eq('user_id', userId)

        if (error) {
          alert(error.message)
          return
        }
      } else {
        const { error } = await supabase.from('favorites').insert({
          song_id: songId,
          user_id: userId,
        })

        if (error) {
          alert(error.message)
          return
        }
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar favorito.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className="text-2xl hover:scale-110 transition disabled:opacity-50"
      title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {loading ? '…' : isFavorite ? '💚' : '🤍'}
    </button>
  )
}