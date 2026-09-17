'use client'

import { useEffect } from 'react'
import usePlayer from '@/hooks/usePlayer'

export default function MediaSession() {
  const {
    currentSong,
    isPlaying,
    pause,
    resume,
    next,
    previous,
  } = usePlayer()

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (!currentSong) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: "Nil's Music",

      artwork: currentSong.thumbnail
        ? [
            {
              src: currentSong.thumbnail,
            },
          ]
        : [],
    })

    navigator.mediaSession.setActionHandler(
      'play',
      () => {
        resume()
      }
    )

    navigator.mediaSession.setActionHandler(
      'pause',
      () => {
        pause()
      }
    )

    navigator.mediaSession.setActionHandler(
      'nexttrack',
      () => {
        next()
      }
    )

    navigator.mediaSession.setActionHandler(
      'previoustrack',
      () => {
        previous()
      }
    )

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
    }
  }, [
    currentSong,
    pause,
    resume,
    next,
    previous,
  ])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.playbackState =
      isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  return null
}