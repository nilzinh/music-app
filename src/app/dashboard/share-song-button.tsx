'use client'

type ShareSongButtonProps = {
  songId: string
}

export default function ShareSongButton({ songId }: ShareSongButtonProps) {
  async function handleShare() {
    const url = `${window.location.origin}/song/${songId}`

    try {
      await navigator.clipboard.writeText(url)

      // abre automaticamente
      window.open(url, '_blank')

    } catch (error) {
      console.error(error)
      alert('Erro ao compartilhar')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-full text-sm font-medium transition"
    >
      Compartilhar
    </button>
  )
}