'use client'

import usePlayer from '@/hooks/usePlayer'

export type HistoryItem = {
  id: string
  video_id: string
  title: string
  channel_title: string
  thumbnail_url: string | null
  played_at: string
}

type Props = {
  history: HistoryItem[]
}

export default function HistoryList({
  history,
}: Props) {
  const {
    currentSong,
    stop,
    setQueue,
  } = usePlayer()

  function handlePlay(item: HistoryItem) {
    if (currentSong?.videoId === item.video_id) {
      stop()
      return
    }

    const songs = history.map((historyItem) => ({
      id: historyItem.id,
      videoId: historyItem.video_id,
      title: historyItem.title,
      artist: historyItem.channel_title,
      thumbnail: historyItem.thumbnail_url ?? '',
    }))

    const startIndex = history.findIndex(
      (historyItem) => historyItem.id === item.id
    )

    setQueue(songs, startIndex)
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-zinc-400">
          Seu histórico ainda está vazio.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map((item) => {
        const isCurrent =
          currentSong?.videoId === item.video_id

        return (
          <div
            key={item.id}
            className={`flex items-center gap-4 rounded-2xl border p-3 transition ${
              isCurrent
                ? 'border-green-500 bg-zinc-900'
                : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs flex-shrink-0">
                Sem capa
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2
                className={`font-semibold truncate ${
                  isCurrent
                    ? 'text-green-400'
                    : 'text-white'
                }`}
              >
                {item.title}
              </h2>

              <p className="text-sm text-zinc-400 truncate mt-1">
                {item.channel_title}
              </p>

              <p className="text-xs text-zinc-500 mt-2">
                {new Intl.DateTimeFormat(
                  'pt-BR',
                  {
                    dateStyle: 'short',
                    timeStyle: 'short',
                    timeZone: 'America/Sao_Paulo',
                  }
                ).format(new Date(item.played_at))}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handlePlay(item)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm ${
                isCurrent
                  ? 'bg-green-500 text-black'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isCurrent ? '■ Parar' : '▶ Tocar'}
            </button>
          </div>
        )
      })}
    </div>
  )
}