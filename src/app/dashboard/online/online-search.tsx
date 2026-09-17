'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
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

type YouTubePlayer = {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  destroy: () => void
}

type YouTubePlayerStateChangeEvent = {
  data: number
}

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      playerVars?: {
        autoplay?: number
        playsinline?: number
      }
      events?: {
        onReady?: () => void
        onStateChange?: (
          event: YouTubePlayerStateChangeEvent
        ) => void
      }
    }
  ) => YouTubePlayer

  PlayerState: {
    ENDED: number
  }
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

export default function OnlineSearch({ userId }: Props) {
  const supabase = createClient()

  const {
    currentSong,
    currentIndex,
    queue,
    stop,
    next,
    setQueue,
    registerController,
  } = usePlayer()

  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [selectedVideo, setSelectedVideo] =
    useState<VideoItem | null>(null)

  const [loading, setLoading] = useState(false)
  const [favoriteLoadingId, setFavoriteLoadingId] =
    useState('')

  const playerRef = useRef<YouTubePlayer | null>(null)
  const playerContainerRef = useRef<HTMLDivElement | null>(null)

  const nextRef = useRef(next)
  const currentIndexRef = useRef(currentIndex)
  const queueLengthRef = useRef(queue.length)

  useEffect(() => {
    nextRef.current = next
  }, [next])

  useEffect(() => {
    currentIndexRef.current = currentIndex
    queueLengthRef.current = queue.length
  }, [currentIndex, queue.length])

  // Carrega a API oficial do YouTube uma única vez.
  useEffect(() => {
    if (window.YT?.Player) {
      return
    }

    const existingScript =
      document.getElementById('youtube-iframe-api')

    if (existingScript) {
      return
    }

    const script = document.createElement('script')

    script.id = 'youtube-iframe-api'
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true

    document.body.appendChild(script)
  }, [])

  // Cria o player sempre que a música atual mudar.
  useEffect(() => {
  if (!currentSong || !playerContainerRef.current) {
    return
  }

  const song = currentSong
  let cancelled = false

    function createPlayer() {
      if (
        cancelled ||
        !window.YT?.Player ||
        !playerContainerRef.current
      ) {
        return
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          // Player anterior já foi removido.
        }

        playerRef.current = null
      }

      // O YouTube substitui o elemento recebido por um iframe.
      // Criamos um elemento novo para cada música.
      playerContainerRef.current.innerHTML = ''

      const playerElement = document.createElement('div')

      playerContainerRef.current.appendChild(playerElement)

      playerRef.current = new window.YT.Player(
        playerElement,
        {
          videoId: song.videoId,

          playerVars: {
            autoplay: 1,
            playsinline: 1,
          },

          events: {
            onReady: () => {
              playerRef.current?.playVideo()
            },

            onStateChange: (event) => {
              if (
                event.data ===
                window.YT?.PlayerState.ENDED
              ) {
                const index = currentIndexRef.current
                const total = queueLengthRef.current

                if (
                  index >= 0 &&
                  index < total - 1
                ) {
                  nextRef.current()
                }
              }
            },
          },
        }
      )
    }

    if (window.YT?.Player) {
      createPlayer()
    } else {
      const previousCallback =
        window.onYouTubeIframeAPIReady

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.()
        createPlayer()
      }
    }

    return () => {
      cancelled = true

      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          // Ignora caso o iframe já tenha sido removido.
        }

        playerRef.current = null
      }
    }
  }, [currentSong])

  // Liga os botões do Mini Player ao player do YouTube.
  useEffect(() => {
    registerController({
      pause: () => {
        playerRef.current?.pauseVideo()
      },

      resume: () => {
        playerRef.current?.playVideo()
      },

      stop: () => {
        playerRef.current?.stopVideo()
        setSelectedVideo(null)
      },
    })

    return () => {
      registerController(null)
    }
  }, [registerController])

  // Sincroniza a lista visual com a música atual.
  useEffect(() => {
    if (!currentSong) {
      setSelectedVideo(null)
      return
    }

    const video = videos.find(
      (item) =>
        item.id.videoId === currentSong.videoId
    )

    if (video) {
      setSelectedVideo(video)
    }
  }, [currentSong, videos])

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
      selectedVideo?.id.videoId ===
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

    setSelectedVideo(video)
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

      
      {/* Player do YouTube controlado pela IFrame API */}
      <div
        className="fixed w-px h-px overflow-hidden -left-10 -bottom-10"
        aria-hidden="true"
      >
        <div ref={playerContainerRef} />
      </div>
    </div>
  )
}