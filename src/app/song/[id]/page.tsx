import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SharedSongPlayer from './shared-song-player'

export default async function SongPage({
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

  const { data: favorite } = await supabase
    .from('online_favorites')
    .select(
      'video_id, title, channel_title, thumbnail_url'
    )
    .eq('video_id', id)
    .maybeSingle()

  const { data: historyItem } = favorite
    ? { data: null }
    : await supabase
        .from('play_history')
        .select(
          'video_id, title, channel_title, thumbnail_url'
        )
        .eq('video_id', id)
        .order('played_at', { ascending: false })
        .limit(1)
        .maybeSingle()

  const song = favorite ?? historyItem

  return (
    <SharedSongPlayer
      videoId={id}
      initialSong={
        song
          ? {
              videoId: song.video_id,
              title: song.title,
              artist: song.channel_title,
              thumbnail: song.thumbnail_url ?? '',
            }
          : null
      }
    />
  )
}