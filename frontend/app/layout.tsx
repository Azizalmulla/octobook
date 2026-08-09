import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/components/language_provider'
import { NavPill } from '@/components/nav_pill'

// implements [S5.5] one combined Google Fonts link carrying Latin and Arabic
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap'

// the deployed origin resolves the open graph image to an absolute url
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : new URL('http://localhost:3000')

// implements [S5.12] and STEP 5e icons, apple, manifest, openGraph, twitter
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: 'Build Your AI and Automation Business | Octopus Ai',
  description:
    'A live webinar on building and developing AI and Automation solutions for businesses, and turning them into scalable technology products and services.',
  openGraph: {
    title: 'Build Your AI and Automation Business | Octopus Ai',
    description:
      'A live webinar on building AI and Automation solutions for businesses and turning them into scalable products and services.',
    images: [{ url: '/og_share.png', width: 1200, height: 630, alt: 'Octopus Ai webinar' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build Your AI and Automation Business | Octopus Ai',
    description:
      'A live webinar on building AI and Automation solutions for businesses and turning them into scalable products and services.',
    images: ['/og_share.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon_192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon_512.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple_icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  // ASSUMPTION [S0.4]: viewport themeColor must be a concrete color string for browsers.
  // Value matches the --shade token defined once in globals.css.
  themeColor: '#070B12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_HREF} rel="stylesheet" />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <NavPill />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
