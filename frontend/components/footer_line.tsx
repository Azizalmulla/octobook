'use client'

// implements [S6.5] one centered muted line on the light ground.
// No contact block, no icons, no links, no card, no powered by line.

import { useLanguage } from './language_provider'

export function FooterLine() {
  const { text } = useLanguage()

  return (
    <footer id="footer" className="ground_light px-5 py-10 text-center">
      <p className="muted_on_light text-xs">{text('footerLine')}</p>
    </footer>
  )
}
