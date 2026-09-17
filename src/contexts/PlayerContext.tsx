'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react'

import { Song } from '@/types/song'

export type PlayerController = {
  pause: () => void
  resume: () => void
  stop: () => void
}

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

  registerController: (controller: PlayerController | null) => void
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

  const controllerRef = useRef<PlayerController | null>(null)

  function registerController(controller: PlayerController | null) {
    controllerRef.current = controller
  }

  function play(song: Song) {
    setCurrentSong(song)
    setIsPlaying(true)
  }

  function pause() {
    controllerRef.current?.pause()
    setIsPlaying(false)
  }

  function resume() {
    if (!currentSong) {
      return
    }

    controllerRef.current?.resume()
    setIsPlaying(true)
  }

  function stop() {
    controllerRef.current?.stop()

    setCurrentSong(null)
    setCurrentIndex(-1)
    setIsPlaying(false)
  }

  function setQueue(songs: Song[], startIndex = 0) {
    setQueueState(songs)
    setCurrentIndex(startIndex)

    const song = songs[startIndex]

    if (song) {
      setCurrentSong(song)
      setIsPlaying(true)
    }
  }

  function next() {
    const nextIndex = currentIndex + 1

    if (nextIndex >= queue.length) {
      return
    }

    setCurrentIndex(nextIndex)
    setCurrentSong(queue[nextIndex])
    setIsPlaying(true)
  }

  function previous() {
    const previousIndex = currentIndex - 1

    if (previousIndex < 0) {
      return
    }

    setCurrentIndex(previousIndex)
    setCurrentSong(queue[previousIndex])
    setIsPlaying(true)
  }

  return (
    <PlayerContext.Provider
      value={{
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
        registerController,
      }}
    >
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