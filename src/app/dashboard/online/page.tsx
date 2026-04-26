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
      <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-4xl font-bold">Buscar músicas online</h1>
          <p className="text-zinc-400 mt-2">
            Pesquise músicas no YouTube e toque sem baixar.
          </p>

          <div className="mt-5 flex gap-3">
            <a
              href="/dashboard"
              className="bg-white text-black px-5 py-3 rounded-full font-semibold"
            >
              Voltar
            </a>
          </div>
        </div>

        <OnlineSearch />
      </div>
    </main>
  )
}