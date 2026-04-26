'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type Playlist = {
  id: string
  name: string
}

type AddToPlaylistButtonProps = {
  songId: string
  userId: string
}

export default function AddToPlaylistButton({
  songId,
  userId,
}: AddToPlaylistButtonProps) {
  const supabase = createClient()

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadPlaylists() {
      const { data } = await supabase
        .from('playlists')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setPlaylists(data || [])
    }

    loadPlaylists()
  }, [supabase, userId])

  async function handleAdd() {
    if (!selectedPlaylist) {
      alert('Escolha uma playlist.')
      return
    }

    try {
      setLoading(true)

      const { data: existing } = await supabase
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', selectedPlaylist)
        .eq('song_id', songId)

      if (existing && existing.length > 0) {
        alert('Essa música já está na playlist.')
        return
      }

      const { error } = await supabase.from('playlist_songs').insert({
        playlist_id: selectedPlaylist,
        song_id: songId,
      })

      if (error) {
        alert(error.message)
        return
      }

      alert('Música adicionada à playlist!')
      setSelectedPlaylist('')
    } catch (error) {
      console.error(error)
      alert('Erro ao adicionar à playlist.')
    } finally {
      setLoading(false)
    }
  }

  if (playlists.length === 0) {
    return (
      <span className="text-xs text-zinc-500">
        Crie uma playlist primeiro
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedPlaylist}
        onChange={(e) => setSelectedPlaylist(e.target.value)}
        className="bg-zinc-800 text-white text-sm rounded px-2 py-2 border border-zinc-700"
      >
        <option value="">Playlist</option>
        {playlists.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-sm"
      >
        {loading ? '...' : '+'}
      </button>
    </div>
  )
}