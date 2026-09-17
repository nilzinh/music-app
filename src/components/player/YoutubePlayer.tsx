'use client'

import usePlayer from '@/hooks/usePlayer'

export default function YoutubePlayer() {
  const { currentSong } = usePlayer()

  if (!currentSong) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        width: '1px',
        height: '1px',
        bottom: '0',
        left: '0',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <iframe
        key={currentSong.videoId}
        width="1"
        height="1"
        src={`https://www.youtube.com/embed/${currentSong.videoId}?autoplay=1&playsinline=1`}
        title={currentSong.title}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  )
}