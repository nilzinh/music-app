import { createClient } from '@/lib/supabase/server'

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: song } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .single()

  if (!song) {
    return (
      <div className="text-white p-10">
        Música não encontrada
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 p-6">
      <div className="w-64 h-64 bg-zinc-800 rounded-xl overflow-hidden">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            Sem capa
          </div>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold">{song.title}</h1>
        <p className="text-zinc-400">{song.artist}</p>
      </div>

      <audio controls autoPlay className="w-full max-w-md">
        <source src={song.file_url} />
      </audio>
    </div>
  )
}