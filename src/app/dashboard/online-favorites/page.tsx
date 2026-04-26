import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnlineFavoritesList from './online-favorites-list'

type OnlineFavorite = {
  id: string
  video_id: string
  title: string
  channel_title: string
  thumbnail_url: string | null
}

export default async function OnlineFavoritesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data } = await supabase
    .from('online_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const favorites: OnlineFavorite[] = data ?? []

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-40">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Favoritos Online</h1>
            <p className="text-zinc-400 text-sm">
              Suas músicas favoritas pesquisadas online
            </p>
          </div>

          <a
            href="/dashboard"
            className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full text-sm font-semibold text-center"
          >
            Voltar
          </a>
        </div>

        <OnlineFavoritesList favorites={favorites} />
      </div>
    </main>
  )
}