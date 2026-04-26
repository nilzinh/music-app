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
  const [selectedVideoId, setSelectedVideoId] = useState('')
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
        alert('Essa música já está nos favoritos.')
        return
      }

      const { error } = await supabase.from('online_favorites').insert({
        user_id: userId,
        video_id: video.id.videoId,
        title: video.snippet.title,
        channel_title: video.snippet.channelTitle,
        thumbnail_url: video.snippet.thumbnails.medium.url,
      })

      if (error) {
        alert(error.message)
        return
      }

      alert('Música adicionada aos favoritos!')
    } catch (error) {
      console.error(error)
      alert('Erro ao favoritar música.')
    } finally {
      setFavoriteLoadingId('')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Ex: Imagine Dragons Believer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-4 rounded-full bg-zinc-950 border border-zinc-800 outline-none focus:border-green-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-6 py-4 rounded-full font-semibold disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {selectedVideoId && (
        <div className="rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 p-4">
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-2xl"
              src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
              title="Player online"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              className="w-full sm:w-40 h-32 sm:h-24 object-cover rounded-xl"
            />

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold line-clamp-2">
                {video.snippet.title}
              </h2>

              <p className="text-sm text-zinc-400 mt-1">
                {video.snippet.channelTitle}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedVideoId(video.id.videoId)}
                  className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full font-semibold text-sm"
                >
                  Tocar online
                </button>

                <button
                  onClick={() => handleFavorite(video)}
                  disabled={favoriteLoadingId === video.id.videoId}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full font-semibold text-sm disabled:opacity-50"
                >
                  {favoriteLoadingId === video.id.videoId
                    ? 'Salvando...'
                    : 'Favoritar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}