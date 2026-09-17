import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import HistoryList, {
  HistoryItem,
} from './history-list'

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data, error } = await supabase
    .from('play_history')
    .select(
      'id, video_id, title, channel_title, thumbnail_url, played_at'
    )
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error(
      'Erro ao carregar histórico:',
      error
    )
  }

  const history: HistoryItem[] = data ?? []

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-40">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Histórico
            </h1>

            <p className="text-zinc-400 text-sm">
              Músicas reproduzidas recentemente
            </p>
          </div>

          <Link
            href="/dashboard"
            className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full text-sm font-semibold text-center"
          >
            Voltar
          </Link>
        </div>

        <HistoryList history={history} />
      </div>
    </main>
  )
}