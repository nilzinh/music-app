'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

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

export default function OnlineSearch({ userId }: Props) {
  const supabase = createClient()

  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [favoriteLoadingId, setFavoriteLoadingId] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    if (!query.trim()) {
      alert('Digite o nome de uma música.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `/api/youtube-search?q=${encodeURIComponent(query)}`
      )

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      setVideos(data.items || [])
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

      const { error } = await supabase.from('online_favorites').insert({
        user_id: userId,
        video_id: video.id.videoId,
        title: video.snippet.title,
        channel_title: video.snippet.channelTitle,
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
    if (selectedVideo?.id.videoId === video.id.videoId) {
      setSelectedVideo(null)
    } else {
      setSelectedVideo(video)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar música..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
          const isCurrent = selectedVideo?.id.videoId === video.id.videoId

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
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                className="w-14 h-14 rounded-md object-cover"
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`truncate font-medium ${
                    isCurrent ? 'text-green-400' : 'text-white'
                  }`}
                >
                  {video.snippet.title}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {video.snippet.channelTitle}
                </p>
              </div>

              <button
                onClick={() => handleToggleVideo(video)}
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  isCurrent
                    ? 'bg-white text-black'
                    : 'bg-green-500 text-black hover:bg-green-400'
                }`}
              >
                {isCurrent ? '■' : '▶'}
              </button>

              <button
                onClick={() => handleFavorite(video)}
                disabled={favoriteLoadingId === video.id.videoId}
                className="text-green-500 text-xl disabled:opacity-50"
              >
                {favoriteLoadingId === video.id.videoId ? '…' : '💚'}
              </button>
            </div>
          )
        })}
      </div>

      {selectedVideo && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-3 shadow-2xl">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <img
              src={selectedVideo.snippet.thumbnails.medium.url}
              alt={selectedVideo.snippet.title}
              className="w-12 h-12 rounded object-cover"
            />

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">
                {selectedVideo.snippet.title}
              </p>
              <p className="text-xs text-zinc-400 truncate">
                {selectedVideo.snippet.channelTitle}
              </p>
            </div>

            <button
              onClick={() => setSelectedVideo(null)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
            >
              Fechar
            </button>
          </div>

          <div className="w-0 h-0 overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}?autoplay=1`}
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </div>
  )
}