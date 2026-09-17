'use client'

import { useEffect, useRef } from 'react'
import usePlayer from '@/hooks/usePlayer'

type YouTubePlayer = {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  destroy: () => void
}

type YouTubeStateEvent = {
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
        onStateChange?: (event: YouTubeStateEvent) => void
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

export default function YoutubeEngine() {
  const {
    currentSong,
    currentIndex,
    queue,
    next,
    registerController,
  } = usePlayer()

  const playerRef = useRef<YouTubePlayer | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (window.YT?.Player) {
      return
    }

    if (document.getElementById('youtube-iframe-api')) {
      return
    }

    const script = document.createElement('script')

    script.id = 'youtube-iframe-api'
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true

    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!currentSong || !containerRef.current) {
      return
    }

    const song = currentSong
    let cancelled = false

    function createPlayer() {
      if (
        cancelled ||
        !window.YT?.Player ||
        !containerRef.current
      ) {
        return
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {}

        playerRef.current = null
      }

      containerRef.current.innerHTML = ''

      const playerElement = document.createElement('div')

      containerRef.current.appendChild(playerElement)

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
                event.data === window.YT?.PlayerState.ENDED
              ) {
                const index = currentIndexRef.current
                const total = queueLengthRef.current

                if (index >= 0 && index < total - 1) {
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
        } catch {}

        playerRef.current = null
      }
    }
  }, [currentSong])

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
      },
    })

    return () => {
      registerController(null)
    }
  }, [registerController])

  return (
    <div
      className="fixed w-px h-px overflow-hidden -left-10 -bottom-10"
      aria-hidden="true"
    >
      <div ref={containerRef} />
    </div>
  )
}