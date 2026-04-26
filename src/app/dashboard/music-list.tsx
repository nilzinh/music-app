'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import FavoriteButton from './favorite-button'
import DeleteSongButton from './delete-song-button'
import AddToPlaylistButton from './add-to-playlist-button'
import ShareSongButton from './share-song-button'

type Song = {
  id: string
  title: string
  artist: string
  file_url: string
  cover_url?: string | null
}

type Favorite = {
  id: string
  song_id: string
  user_id: string
}

type MusicListProps = {
  songs: Song[]
  favorites: Favorite[]
  userId: string
}

export default function MusicList({
  songs,
  favorites,
  userId,
}: MusicListProps) {
  const [search, setSearch] = useState('')
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoPlayRequested, setAutoPlayRequested] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [volume, setVolume] = useState(1)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const filteredSongs = useMemo(() => {
    const term = search.toLowerCase().trim()

    if (!term) return songs

    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(term) ||
        song.artist.toLowerCase().includes(term)
    )
  }, [songs, search])

  const currentSong =
    currentSongIndex >= 0 && currentSongIndex < filteredSongs.length
      ? filteredSongs[currentSongIndex]
      : null

  function formatTime(time: number) {
    if (!isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  function playSongByIndex(index: number, autoPlay = true) {
    if (filteredSongs.length === 0) return
    setCurrentSongIndex(index)
    setIsPlaying(autoPlay)
    setAutoPlayRequested(autoPlay)
    setCurrentTime(0)
  }

  function handlePlay(index: number) {
    playSongByIndex(index, true)
  }

  function handleTogglePlayPause() {
    if (!audioRef.current || !currentSong) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      setAutoPlayRequested(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error('Erro ao tocar:', error))
    }
  }

  function getRandomIndex() {
    if (filteredSongs.length <= 1) {
      return currentSongIndex === -1 ? 0 : currentSongIndex
    }

    let randomIndex = currentSongIndex
    while (randomIndex === currentSongIndex) {
      randomIndex = Math.floor(Math.random() * filteredSongs.length)
    }
    return randomIndex
  }

  function handleNextSong() {
    if (filteredSongs.length === 0) return

    let nextIndex: number

    if (isShuffle) {
      nextIndex = getRandomIndex()
    } else {
      nextIndex =
        currentSongIndex === -1
          ? 0
          : currentSongIndex === filteredSongs.length - 1
          ? 0
          : currentSongIndex + 1
    }

    playSongByIndex(nextIndex, true)
  }

  function handlePrevSong() {
    if (filteredSongs.length === 0) return

    let prevIndex: number

    if (isShuffle) {
      prevIndex = getRandomIndex()
    } else {
      prevIndex =
        currentSongIndex === -1
          ? 0
          : currentSongIndex === 0
          ? filteredSongs.length - 1
          : currentSongIndex - 1
    }

    playSongByIndex(prevIndex, true)
  }

  function handleEnded() {
    if (!audioRef.current) return

    if (isRepeat) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.error('Erro ao repetir música:', error)
      })
      return
    }

    let nextIndex: number

    if (isShuffle) {
      nextIndex = getRandomIndex()
    } else {
      nextIndex =
        currentSongIndex === filteredSongs.length - 1 ? 0 : currentSongIndex + 1
    }

    setCurrentSongIndex(nextIndex)
    setAutoPlayRequested(true)
    setIsPlaying(true)
    setCurrentTime(0)
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  function handleLoadedMetadata() {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration || 0)
    audioRef.current.volume = volume
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const newTime = Number(e.target.value)
    if (!audioRef.current) return
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  useEffect(() => {
    if (!audioRef.current || !currentSong) return

    audioRef.current.volume = volume

    if (autoPlayRequested) {
      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setAutoPlayRequested(false)
          })
          .catch((error) => {
            console.error('Erro ao tocar próxima música:', error)
            setIsPlaying(false)
            setAutoPlayRequested(false)
          })
      }
    }
  }, [currentSong, autoPlayRequested, volume])

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por título ou artista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 rounded-full bg-zinc-900 text-white outline-none border border-zinc-800 placeholder:text-zinc-500 focus:border-green-500"
        />
      </div>

      {filteredSongs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-400">
          Nenhuma música encontrada.
        </div>
      ) : (
        <div className="flex flex-col gap-2 pb-56">
          {filteredSongs.map((song, index) => {
            const isFavorite = favorites.some((fav) => fav.song_id === song.id)
            const isCurrent = currentSong?.id === song.id

            return (
              <div
                key={song.id}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl px-4 py-3 transition ${
                  isCurrent
                    ? 'bg-zinc-900 border border-zinc-800'
                    : 'hover:bg-zinc-950'
                }`}
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-zinc-500">♪</span>
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`font-medium truncate ${
                      isCurrent ? 'text-green-400' : 'text-white'
                    }`}
                  >
                    {song.title}
                  </p>
                  <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePlay(index)}
                    className="bg-green-500 hover:bg-green-400 text-black w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shadow-md transition"
                    title="Tocar"
                  >
                    ▶
                  </button>

                  <AddToPlaylistButton songId={song.id} userId={userId} />
                  <ShareSongButton songId={song.id} />
                  <FavoriteButton
                    songId={song.id}
                    userId={userId}
                    isFavorite={isFavorite}
                  />
                  <DeleteSongButton songId={song.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/98 backdrop-blur-md px-4 py-3 shadow-2xl">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr_220px] gap-4 items-center">
            <div className="hidden lg:flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-md overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
                {currentSong.cover_url ? (
                  <img
                    src={currentSong.cover_url}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-zinc-500 text-xs">♪</span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{currentSong.title}</p>
                <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`text-sm transition ${
                    isShuffle ? 'text-green-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🔀
                </button>

                <button
                  onClick={handlePrevSong}
                  className="text-zinc-300 hover:text-white transition"
                >
                  ⏮
                </button>

                <button
                  onClick={handleTogglePlayPause}
                  className="bg-white text-black hover:scale-105 w-11 h-11 rounded-full flex items-center justify-center font-bold transition"
                >
                  {isPlaying ? '❚❚' : '▶'}
                </button>

                <button
                  onClick={handleNextSong}
                  className="text-zinc-300 hover:text-white transition"
                >
                  ⏭
                </button>

                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`text-sm transition ${
                    isRepeat ? 'text-green-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🔁
                </button>
              </div>

              <div className="flex items-center gap-3 w-full max-w-[680px]">
                <span className="text-[11px] text-zinc-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-white cursor-pointer"
                />

                <span className="text-[11px] text-zinc-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-end gap-3">
              <span className="text-sm text-zinc-400">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-28 accent-white cursor-pointer"
              />
            </div>

            <audio
              key={currentSong.id}
              ref={audioRef}
              className="hidden"
              src={currentSong.file_url}
              onEnded={handleEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </div>
        </div>
      )}
    </>
  )
}