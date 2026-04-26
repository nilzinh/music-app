import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type Song = {
  id: string
  title: string
  artist: string
  file_url: string
  cover_url?: string | null
}

type PlaylistSong = {
  id: string
  song_id: string
}

export default async function PlaylistDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: playlist } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single()

  const { data: playlistSongsData } = await supabase
    .from('playlist_songs')
    .select('*')
    .eq('playlist_id', id)

  const { data: songsData } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })

  const playlistSongs: PlaylistSong[] = playlistSongsData ?? []
  const songs: Song[] = songsData ?? []

  const songsInPlaylist = songs.filter((song) =>
    playlistSongs.some((item) => item.song_id === song.id)
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-2">
                Playlist
              </p>
              <h1 className="text-4xl font-bold">{playlist?.name || 'Playlist'}</h1>
            </div>

            <div className="flex gap-3">
              <a
                href="/dashboard/playlists"
                className="bg-white text-black hover:bg-zinc-200 px-5 py-3 rounded-full font-semibold transition"
              >
                Voltar
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 md:p-5">
          {songsInPlaylist.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-400">
              Essa playlist ainda não tem músicas.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {songsInPlaylist.map((song) => (
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

                  <audio controls className="max-w-xs">
                    <source src={song.file_url} />
                  </audio>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}