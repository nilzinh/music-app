import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/dashboard', // resolve o aviso de App ID
    name: "Nil's Music",
    short_name: "Nil's Music",
    description: "Busque e ouça músicas online com Nil's Music",
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#22c55e',
    orientation: 'portrait',

    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      // se quiser manter maskable, deixe só se o ícone tiver “safe area” (padding)
      
    ],

    screenshots: [
  {
    src: '/screenshot-desktop.png',
    sizes: '1280x720',
    type: 'image/png',
    form_factor: 'wide',
  },
  {
    src: '/screenshot-mobile.png',
    sizes: '720x1280',
    type: 'image/png',
  },
     ],
  }
}