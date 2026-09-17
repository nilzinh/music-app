'use client'

import Link from 'next/link'
import usePlayer from '@/hooks/usePlayer'
import { Song } from '@/types/song'
import InstallAppButton from '@/components/InstallAppButton'

type Props = {
  videoId: string
  initialSong: Omit<Song, 'id'> | null
}

export default function SharedSongPlayer({
  videoId,
  initialSong,
}: Props) {
  const { currentSong, play, stop } = usePlayer()

  const song: Song = initialSong
    ? {
        id: videoId,
        ...initialSong,
      }
    : {
        id: videoId,
        videoId,
        title: 'Música compartilhada',
        artist: 'YouTube',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      }

  const isCurrent =
    currentSong?.videoId === song.videoId

  function handlePlay() {
    if (isCurrent) {
      stop()
      return
    }

    play(song)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto px-4 py-10 pb-40">

        <Link
          href="/dashboard"
          className="inline-block mb-8 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full text-sm"
        >
          ← Nil&apos;s Music
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full aspect-square object-cover rounded-2xl"
          />

          <div className="mt-6 text-center">
            <h1 className="text-2xl font-bold">
              {song.title}
            </h1>

            <p className="text-zinc-400 mt-2">
              {song.artist}
            </p>
          </div>

          <div className="mt-6 space-y-3">

            <button
              type="button"
              onClick={handlePlay}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-full"
            >
              {isCurrent
                ? '■ Parar'
                : '▶ Tocar no Nil\'s Music'}
            </button>

            <InstallAppButton />

          </div>

        </div>
      </div>
    </main>
  )
}