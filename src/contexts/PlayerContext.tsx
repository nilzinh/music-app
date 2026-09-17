'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'
import { Song } from '@/types/song'

export type PlayerContextType = {
  currentSong: Song | null
  queue: Song[]
  currentIndex: number
  isPlaying: boolean

  play: (song: Song) => void
  pause: () => void
  resume: () => void
  stop: () => void

  next: () => void
  previous: () => void

  setQueue: (songs: Song[], startIndex?: number) => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({
  children,
}: {
  children: ReactNode
}) {
  const [queue, setQueueState] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  function play(song: Song) {
    setCurrentSong(song)
    setIsPlaying(true)
  }

  function pause() {
    setIsPlaying(false)
  }

  function resume() {
    if (currentSong) {
      setIsPlaying(true)
    }
  }

  function stop() {
    setCurrentSong(null)
    setCurrentIndex(-1)
    setIsPlaying(false)
  }

  function setQueue(songs: Song[], startIndex = 0) {
    setQueueState(songs)
    setCurrentIndex(startIndex)

    if (songs[startIndex]) {
      setCurrentSong(songs[startIndex])
      setIsPlaying(true)
    }
  }

  function next() {
    if (currentIndex < queue.length - 1) {
      const index = currentIndex + 1

      setCurrentIndex(index)
      setCurrentSong(queue[index])
      setIsPlaying(true)
    }
  }

  function previous() {
    if (currentIndex > 0) {
      const index = currentIndex - 1

      setCurrentIndex(index)
      setCurrentSong(queue[index])
      setIsPlaying(true)
    }
  }

  const value = useMemo(
    () => ({
      currentSong,
      queue,
      currentIndex,
      isPlaying,
      play,
      pause,
      resume,
      stop,
      next,
      previous,
      setQueue,
    }),
    [currentSong, queue, currentIndex, isPlaying]
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayerContext() {
  const context = useContext(PlayerContext)

  if (!context) {
    throw new Error(
      'usePlayerContext deve ser usado dentro do PlayerProvider'
    )
  }

  return context
}