import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UploadForm from './upload-form'
import MusicList from './music-list'

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

export default async function DashboardPage() {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-56">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-green-900/30 via-zinc-900 to-zinc-950 p-6 md:p-8 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent_35%)]" />

          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-3">
                Seu streaming pessoal
              </p>
              <h1 className="text-4xl md:text-6xl font-bold leading-none">
                Meu Music App
              </h1>
              <p className="text-zinc-300 mt-4 break-all">
                Conectado como {user.email}
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">
                  🎵 {songs.length} músicas
                </div>
                <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm">
                  💚 {favorites.length} favoritas
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/dashboard/favorites"
                className="bg-white text-black hover:bg-zinc-200 px-5 py-3 rounded-full font-semibold transition"
              >
                Ver favoritos
              </a>

              <form action="/logout" method="post">
                <button className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-full font-semibold transition">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <UploadForm userId={user.id} />
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold">Biblioteca</h2>
            <p className="text-zinc-400 mt-1">
              Busque, toque, favorite e gerencie suas músicas
            </p>
          </div>

          <MusicList songs={songs} favorites={favorites} userId={user.id} />
        </section>
      </div>
    </main>
  )
}