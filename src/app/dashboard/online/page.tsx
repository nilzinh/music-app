import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnlineSearch from './online-search'

export default async function OnlinePage() {
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Buscar online</h1>
            <p className="text-zinc-400 text-sm">
              Pesquise músicas online e toque sem baixar.
            </p>
          </div>

          <a
            href="/dashboard"
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold"
          >
            Voltar
          </a>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <OnlineSearch userId={user.id} />
        </div>
      </div>
    </main>
  )
}