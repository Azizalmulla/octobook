'use client'

// implements [S5.3] floating contained pill, language toggle only.
// No brand name, no section links, no call to action, no logo, no burger icon.

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { LanguageToggle } from './language_toggle'

type Ground = 'dark' | 'light'

export function NavPill() {
  const [ground, setGround] = useState<Ground>('dark')

  // The pill floats over sections of both grounds, so it reads the ground
  // sitting directly beneath it and repaints itself to stay legible.
  useEffect(() => {
    const read = () => {
      const probe = document.elementsFromPoint(window.innerWidth / 2, 46)
      const section = probe.find(
        (node) =>
          node instanceof HTMLElement &&
          (node.classList.contains('ground_light') || node.classList.contains('ground_dark')),
      )
      if (!section) return
      setGround(section.classList.contains('ground_light') ? 'light' : 'dark')
    }

    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [])

  return (
    <nav
      id="nav"
      data-ground={ground}
      className={cn('nav', ground === 'light' ? 'glass_light' : 'glass')}
      aria-label="Language"
    >
      <LanguageToggle />
    </nav>
  )
}
