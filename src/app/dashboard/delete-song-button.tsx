'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type DeleteSongButtonProps = {
  songId: string
}

type SongData = {
  id: string
  file_path: string
  cover_url?: string | null
}

export default function DeleteSongButton({ songId }: DeleteSongButtonProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function extractCoverPathFromUrl(url: string) {
    const marker = '/storage/v1/object/public/covers/'
    const index = url.indexOf(marker)

    if (index === -1) return null

    return url.substring(index + marker.length)
  }

  async function handleDelete() {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta música?')

    if (!confirmed) return

    try {
      setLoading(true)

      const { data: song, error: fetchError } = await supabase
        .from('songs')
        .select('id, file_path, cover_url')
        .eq('id', songId)
        .single<SongData>()

      if (fetchError) {
        alert('Erro ao buscar música: ' + fetchError.message)
        return
      }

      if (!song) {
        alert('Música não encontrada.')
        return
      }

      if (song.file_path) {
        const { error: removeSongFileError } = await supabase.storage
          .from('songs')
          .remove([song.file_path])

        if (removeSongFileError) {
          alert('Erro ao apagar arquivo da música: ' + removeSongFileError.message)
          return
        }
      }

      if (song.cover_url) {
        const coverPath = extractCoverPathFromUrl(song.cover_url)

        if (coverPath) {
          const { error: removeCoverError } = await supabase.storage
            .from('covers')
            .remove([coverPath])

          if (removeCoverError) {
            alert('Erro ao apagar capa: ' + removeCoverError.message)
            return
          }
        }
      }

      const { error: deleteRowError } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)

      if (deleteRowError) {
        alert('Erro ao excluir música do banco: ' + deleteRowError.message)
        return
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao excluir música.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition disabled:opacity-50"
      title="Excluir música"
    >
      <span className="text-lg text-red-400">{loading ? '…' : '🗑'}</span>
    </button>
  )
}