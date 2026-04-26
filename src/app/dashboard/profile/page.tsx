import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: songs } = await supabase
    .from('songs')
    .select('id')
    .eq('user_id', user.id)

  const { data: favorites } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)

  const { data: playlists } = await supabase
    .from('playlists')
    .select('id')
    .eq('user_id', user.id)

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8 shadow-2xl">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-2">
                Perfil
              </p>
              <h1 className="text-4xl font-bold">Minha conta</h1>
              <p className="text-zinc-400 mt-3 break-all">{user.email}</p>
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

          <div className="grid md:grid-cols-3 gap-4">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400 mb-2">Músicas</p>
              <p className="text-3xl font-bold">{songs?.length ?? 0}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400 mb-2">Favoritas</p>
              <p className="text-3xl font-bold">{favorites?.length ?? 0}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400 mb-2">Playlists</p>
              <p className="text-3xl font-bold">{playlists?.length ?? 0}</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}