'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import usePlayer from '@/hooks/usePlayer'

type VideoItem = {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    channelTitle: string
    thumbnails: {
      medium: {
        url: string
      }
      high?: {
        url: string
      }
    }
  }
}

type Props = {
  userId: string
}

const SEARCH_QUERY_KEY = 'nils-music-search-query'
const SEARCH_RESULTS_KEY = 'nils-music-search-results'

export default function OnlineSearch({ userId }: Props) {
  const supabase = createClient()

  const {
    currentSong,
    stop,
    setQueue,
  } = usePlayer()

  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [favoriteLoadingId, setFavoriteLoadingId] = useState('')
  const [restored, setRestored] = useState(false)

  // Recupera a última busca quando voltar para a página.
  useEffect(() => {
    try {
      const savedQuery =
        sessionStorage.getItem(SEARCH_QUERY_KEY)

      const savedResults =
        sessionStorage.getItem(SEARCH_RESULTS_KEY)

      if (savedQuery) {
        setQuery(savedQuery)
      }

      if (savedResults) {
        const parsed = JSON.parse(savedResults)

        if (Array.isArray(parsed)) {
          setVideos(parsed)
        }
      }
    } catch (error) {
      console.error(
        'Erro ao recuperar a última busca:',
        error
      )
    } finally {
      setRestored(true)
    }
  }, [])

  // Guarda o texto pesquisado.
  useEffect(() => {
    if (!restored) {
      return
    }

    try {
      sessionStorage.setItem(
        SEARCH_QUERY_KEY,
        query
      )
    } catch (error) {
      console.error(
        'Erro ao salvar o texto da busca:',
        error
      )
    }
  }, [query, restored])

  // Guarda os resultados encontrados.
  useEffect(() => {
    if (!restored) {
      return
    }

    try {
      sessionStorage.setItem(
        SEARCH_RESULTS_KEY,
        JSON.stringify(videos)
      )
    } catch (error) {
      console.error(
        'Erro ao salvar os resultados:',
        error
      )
    }
  }, [videos, restored])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    if (!query.trim()) {
      alert('Digite o nome de uma música.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `/api/youtube-search?q=${encodeURIComponent(
          query
        )}`
      )

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      const results: VideoItem[] = data.items || []

      setVideos(results)

      // Salva imediatamente a busca concluída.
      sessionStorage.setItem(
        SEARCH_QUERY_KEY,
        query
      )

      sessionStorage.setItem(
        SEARCH_RESULTS_KEY,
        JSON.stringify(results)
      )
    } catch (error) {
      console.error(error)
      alert('Erro ao buscar músicas.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFavorite(video: VideoItem) {
    try {
      setFavoriteLoadingId(video.id.videoId)

      const { data: existing } = await supabase
        .from('online_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('video_id', video.id.videoId)

      if (existing && existing.length > 0) {
        alert('Já está nos favoritos.')
        return
      }

      const { error } = await supabase
        .from('online_favorites')
        .insert({
          user_id: userId,
          video_id: video.id.videoId,
          title: video.snippet.title,
          channel_title:
            video.snippet.channelTitle,
          thumbnail_url:
            video.snippet.thumbnails.high?.url ||
            video.snippet.thumbnails.medium.url,
        })

      if (error) {
        alert(error.message)
        return
      }

      alert('Favoritado!')
    } catch (error) {
      console.error(error)
      alert('Erro ao favoritar.')
    } finally {
      setFavoriteLoadingId('')
    }
  }

  function handleToggleVideo(video: VideoItem) {
    if (
      currentSong?.videoId ===
      video.id.videoId
    ) {
      stop()
      return
    }

    const songs = videos.map((item) => ({
      id: item.id.videoId,
      videoId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium.url,
    }))

    const startIndex = videos.findIndex(
      (item) =>
        item.id.videoId === video.id.videoId
    )

    setQueue(songs, startIndex)
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className="flex gap-3"
      >
        <input
          type="text"
          id="music-search"
          name="music-search"
          placeholder="Buscar música..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          className="flex-1 p-4 rounded-full bg-zinc-950 border border-zinc-800 outline-none focus:border-green-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 hover:bg-green-400 text-black px-6 rounded-full font-bold disabled:opacity-50"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </form>

      <div className="space-y-3 pb-40">
        {videos.map((video) => {
          const isCurrent =
            currentSong?.videoId ===
            video.id.videoId

          return (
            <div
              key={video.id.videoId}
              className={`flex items-center gap-3 p-3 rounded-xl transition ${
                isCurrent
                  ? 'bg-zinc-900 border border-green-500'
                  : 'bg-zinc-950 border border-zinc-800'
              }`}
            >
              <img
                src={
                  video.snippet.thumbnails.medium
                    .url
                }
                alt={video.snippet.title}
                className="w-14 h-14 rounded-md object-cover"
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`truncate font-medium ${
                    isCurrent
                      ? 'text-green-400'
                      : 'text-white'
                  }`}
                >
                  {video.snippet.title}
                </p>

                <p className="text-xs text-zinc-400 truncate">
                  {video.snippet.channelTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleToggleVideo(video)
                }
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  isCurrent
                    ? 'bg-white text-black'
                    : 'bg-green-500 text-black hover:bg-green-400'
                }`}
                title={
                  isCurrent
                    ? 'Parar'
                    : 'Reproduzir'
                }
              >
                {isCurrent ? '■' : '▶'}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFavorite(video)
                }
                disabled={
                  favoriteLoadingId ===
                  video.id.videoId
                }
                className="text-green-500 text-xl disabled:opacity-50"
                title="Adicionar aos favoritos"
              >
                {favoriteLoadingId ===
                video.id.videoId
                  ? '…'
                  : '💚'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}