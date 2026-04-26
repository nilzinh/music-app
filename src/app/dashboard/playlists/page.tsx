import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreatePlaylistForm from './create-playlist-form'

type Playlist = {
  id: string
  name: string
}

export default async function PlaylistsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: playlistsData } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const playlists: Playlist[] = playlistsData ?? []

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-2">
                Suas coleções
              </p>
              <h1 className="text-4xl font-bold">Playlists</h1>
            </div>

            <div className="flex gap-3">
              <a
                href="/dashboard"
                className="bg-white text-black hover:bg-zinc-200 px-5 py-3 rounded-full font-semibold transition"
              >
                Voltar
              </a>

              <form action="/logout" method="post">
                <button className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-full font-semibold transition">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <CreatePlaylistForm userId={user.id} />
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 md:p-5">
          {playlists.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-400">
              Você ainda não criou nenhuma playlist.
            </div>
          ) : (
            <div className="grid gap-3">
              {playlists.map((playlist) => (
                <a
                  key={playlist.id}
                  href={`/dashboard/playlists/${playlist.id}`}
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition px-5 py-4"
                >
                  <div>
                    <p className="font-semibold text-lg">{playlist.name}</p>
                    <p className="text-sm text-zinc-400">Abrir playlist</p>
                  </div>

                  <span className="text-zinc-400">→</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}