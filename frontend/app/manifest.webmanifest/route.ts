// implements [S5.12] the site manifest points at the processed logo set

export const dynamic = 'force-static'

export function GET() {
  // ASSUMPTION [S0.4]: Web App Manifest requires concrete color strings.
  // Values match --shade from the token root in globals.css.
  return Response.json(
    {
      name: 'Octopus Ai Webinar',
      short_name: 'Octopus Ai',
      description: 'Build Your AI and Automation Business, a live webinar.',
      start_url: '/',
      display: 'standalone',
      background_color: '#070B12',
      theme_color: '#070B12',
      icons: [
        { src: '/icon_192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon_512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } },
  )
}
