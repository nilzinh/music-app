import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Music App</h1>

      <Link href="/auth">
        <button>Ir para login</button>
      </Link>
    </main>
  )
}