'use client'

import usePlayer from '@/hooks/usePlayer'

export default function Player() {
  const {
    currentSong,
    currentIndex,
    queue,
    isPlaying,
    pause,
    resume,
    stop,
    next,
    previous,
  } = usePlayer()

  if (!currentSong) return null

  function handlePlayPause() {
    if (isPlaying) {
      pause()
    } else {
      resume()
    }
  }

  async function handleShare() {
    if (!currentSong) return

    const songUrl =
      `${window.location.origin}/song/${encodeURIComponent(currentSong.videoId)}`

    const shareData = {
      title: currentSong.title,
      text: `🎵 ${currentSong.title} — ${currentSong.artist}\nOuça no Nil's Music`,
      url: songUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }

      await navigator.clipboard.writeText(songUrl)
      alert('Link da música copiado!')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Erro ao compartilhar:', error)

      try {
        await navigator.clipboard.writeText(songUrl)
        alert('Link da música copiado!')
      } catch {
        alert('Não foi possível compartilhar esta música.')
      }
    }
  }

  const hasPrevious = currentIndex > 0
  const hasNext =
    currentIndex >= 0 &&
    currentIndex < queue.length - 1

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-3 z-50">
      <div className="max-w-5xl mx-auto flex items-center gap-3">

        <img
          src={currentSong.thumbnail}
          alt={currentSong.title}
          className="w-12 h-12 rounded object-cover"
        />

        <div className="flex-1 min-w-0">
          <p className="truncate font-semibold text-white">
            {currentSong.title}
          </p>

          <p className="truncate text-xs text-zinc-400">
            {currentSong.artist}
          </p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="text-white text-xl px-2 py-2 hover:text-green-400"
          title="Compartilhar"
          aria-label="Compartilhar música"
        >
          ↗
        </button>

        <button
          type="button"
          onClick={previous}
          disabled={!hasPrevious}
          className="text-white text-xl px-2 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Anterior"
        >
          ⏮
        </button>

        <button
          type="button"
          onClick={handlePlayPause}
          className="bg-green-500 hover:bg-green-400 text-black rounded-full w-11 h-11 flex items-center justify-center font-bold"
          title={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>

        <button
          type="button"
          onClick={next}
          disabled={!hasNext}
          className="text-white text-xl px-2 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Próxima"
        >
          ⏭
        </button>

        <button
          type="button"
          onClick={stop}
          className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
          title="Fechar"
        >
          ✕
        </button>

      </div>
    </div>
  )
}