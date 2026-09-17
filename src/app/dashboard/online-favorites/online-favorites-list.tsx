'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import usePlayer from '@/hooks/usePlayer'

type OnlineFavorite = {
  id: string
  video_id: string
  title: string
  channel_title: string
  thumbnail_url: string | null
}

type Props = {
  favorites: OnlineFavorite[]
}

export default function OnlineFavoritesList({
  favorites,
}: Props) {
  const supabase = createClient()
  const router = useRouter()

  const {
    currentSong,
    stop,
    setQueue,
  } = usePlayer()

  const [loadingId, setLoadingId] = useState('')

  function handlePlay(favorite: OnlineFavorite) {
    // Se clicar novamente na música que já está tocando,
    // o player é fechado.
    if (currentSong?.videoId === favorite.video_id) {
      stop()
      return
    }

    // Transforma todos os favoritos em uma fila.
    const songs = favorites.map((item) => ({
      id: item.id,
      videoId: item.video_id,
      title: item.title,
      artist: item.channel_title,
      thumbnail: item.thumbnail_url ?? '',
    }))

    // Descobre a posição da música clicada.
    const startIndex = favorites.findIndex(
      (item) => item.id === favorite.id
    )

    // Envia toda a lista para o Player Global.
    setQueue(songs, startIndex)
  }

  async function handleRemove(id: string) {
    const confirmed = window.confirm(
      'Remover dos favoritos?'
    )

    if (!confirmed) {
      return
    }

    try {
      setLoadingId(id)

      const { error } = await supabase
        .from('online_favorites')
        .delete()
        .eq('id', id)

      if (error) {
        alert(error.message)
        return
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao remover favorito.')
    } finally {
      setLoadingId('')
    }
  }

  return (
    <div className="space-y-6">
      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
          Nenhuma música online favoritada ainda.
        </div>
      ) : (
        <div className="grid gap-3">
          {favorites.map((favorite) => {
            const isCurrent =
              currentSong?.videoId === favorite.video_id

            return (
              <div
                key={favorite.id}
                className={`flex flex-col sm:flex-row gap-4 rounded-2xl border p-3 transition ${
                  isCurrent
                    ? 'border-green-500 bg-zinc-900'
                    : 'border-zinc-800 bg-zinc-900'
                }`}
              >
                {favorite.thumbnail_url ? (
                  <img
                    src={favorite.thumbnail_url}
                    alt={favorite.title}
                    className="w-full sm:w-40 h-32 sm:h-24 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full sm:w-40 h-32 sm:h-24 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                    Sem capa
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h2
                    className={`font-semibold line-clamp-2 ${
                      isCurrent
                        ? 'text-green-400'
                        : 'text-white'
                    }`}
                  >
                    {favorite.title}
                  </h2>

                  <p className="text-sm text-zinc-400 mt-1">
                    {favorite.channel_title}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handlePlay(favorite)
                      }
                      className={`px-4 py-2 rounded-full font-semibold text-sm ${
                        isCurrent
                          ? 'bg-green-500 text-black'
                          : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      {isCurrent ? '■ Parar' : '▶ Tocar'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(favorite.id)
                      }
                      disabled={
                        loadingId === favorite.id
                      }
                      className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full font-semibold text-sm disabled:opacity-50"
                    >
                      {loadingId === favorite.id
                        ? 'Removendo...'
                        : 'Remover'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}