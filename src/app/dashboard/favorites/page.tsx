import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FavoriteButton from '../favorite-button'
import DeleteSongButton from '../delete-song-button'

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

export default async function FavoritesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: songsData } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: favoritesData } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)

  const songs: Song[] = songsData ?? []
  const favorites: Favorite[] = favoritesData ?? []

  const favoriteSongs = songs.filter((song) =>
    favorites.some((fav) => fav.song_id === song.id)
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-40">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-pink-900/30 via-zinc-900 to-zinc-950 p-6 md:p-8 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.18),transparent_35%)]" />

          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-3">
                Sua seleção
              </p>
              <h1 className="text-4xl md:text-6xl font-bold leading-none">
                Favoritas
              </h1>
              <p className="text-zinc-300 mt-4">
                Suas músicas marcadas com coração
              </p>

              <div className="mt-5 inline-flex px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">
                💚 {favoriteSongs.length} músicas favoritas
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm p-4 md:p-5">
          {favoriteSongs.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-400">
              Você ainda não favoritou nenhuma música.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {favoriteSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-zinc-900 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
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
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-zinc-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <FavoriteButton
                      songId={song.id}
                      userId={user.id}
                      isFavorite={true}
                    />

                    <DeleteSongButton songId={song.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}