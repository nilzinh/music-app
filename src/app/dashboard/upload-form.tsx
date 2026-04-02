'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type UploadFormProps = {
  userId: string
}

export default function UploadForm({ userId }: UploadFormProps) {
  const supabase = createClient()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()

    if (!title || !artist || !musicFile) {
      alert('Preencha título, artista e escolha uma música.')
      return
    }

    try {
      setLoading(true)

      const musicExt = musicFile.name.split('.').pop()
      const musicName = `${Date.now()}-music.${musicExt}`
      const musicPath = `${userId}/${musicName}`

      const { error: uploadMusicError } = await supabase.storage
        .from('songs')
        .upload(musicPath, musicFile)

      if (uploadMusicError) {
        alert('Erro no upload da música: ' + uploadMusicError.message)
        return
      }

      const { data: musicPublicUrlData } = supabase.storage
        .from('songs')
        .getPublicUrl(musicPath)

      const fileUrl = musicPublicUrlData.publicUrl

      let coverUrl: string | null = null

      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop()
        const coverName = `${Date.now()}-cover.${coverExt}`
        const coverPath = `${userId}/${coverName}`

        const { error: uploadCoverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile)

        if (uploadCoverError) {
          alert('Erro no upload da capa: ' + uploadCoverError.message)
          return
        }

        const { data: coverPublicUrlData } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath)

        coverUrl = coverPublicUrlData.publicUrl
      }

      const { error: insertError } = await supabase.from('songs').insert({
        user_id: userId,
        title,
        artist,
        file_path: musicPath,
        file_url: fileUrl,
        cover_url: coverUrl,
      })

      if (insertError) {
        alert('Erro ao salvar no banco: ' + insertError.message)
        return
      }

      alert('Música enviada com sucesso!')

      setTitle('')
      setArtist('')
      setMusicFile(null)
      setCoverFile(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao enviar música.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleUpload}
      className="rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md p-6 md:p-8 shadow-2xl"
    >
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-2">
          Upload
        </p>
        <h2 className="text-2xl md:text-3xl font-bold">Adicionar nova música</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Título da música"
          className="w-full p-4 rounded-2xl bg-zinc-950 text-white outline-none border border-zinc-800 placeholder:text-zinc-500 focus:border-green-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Nome do artista"
          className="w-full p-4 rounded-2xl bg-zinc-950 text-white outline-none border border-zinc-800 placeholder:text-zinc-500 focus:border-green-500"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />

        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4">
          <label className="block mb-2 text-sm text-zinc-300">
            Arquivo da música
          </label>
          <input
            type="file"
            accept="audio/*"
            className="w-full text-sm text-zinc-300"
            onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4">
          <label className="block mb-2 text-sm text-zinc-300">
            Capa da música
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-zinc-300"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar música'}
        </button>
      </div>
    </form>
  )
}