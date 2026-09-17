'use client'

import { useEffect } from 'react'

type YoutubeApiWindow = Window & {
  YT?: {
    Player?: unknown
  }
  onYouTubeIframeAPIReady?: () => void
}

type Props = {
  onReady: () => void
}

export default function YoutubeApiLoader({ onReady }: Props) {
  useEffect(() => {
    const youtubeWindow = window as YoutubeApiWindow

    if (youtubeWindow.YT?.Player) {
      onReady()
      return
    }

    const existingScript = document.getElementById(
      'youtube-iframe-api'
    )

    if (!existingScript) {
      const script = document.createElement('script')

      script.id = 'youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'

      document.body.appendChild(script)
    }

    youtubeWindow.onYouTubeIframeAPIReady = () => {
      onReady()
    }
  }, [onReady])

  return null
}