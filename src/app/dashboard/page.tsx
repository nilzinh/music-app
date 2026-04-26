import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnlineSearch from './online/online-search'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-40">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Nil's Music</h1>
            <p className="text-zinc-400 text-sm">
              Buscar e ouvir músicas online
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/dashboard/online-favorites"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm font-semibold"
            >
              Favoritos
            </a>

            <form action="/logout" method="post">
              <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full text-sm">
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <OnlineSearch userId={user.id} />
        </div>
      </div>
    </main>
  )
}