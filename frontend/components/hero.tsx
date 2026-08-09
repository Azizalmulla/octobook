'use client'

// implements [S6.3] hero content and [S5.11] a token tinted placeholder for an
// image that has not been uploaded yet. The logo never appears here, per [S5.12].

import Image from 'next/image'
import { useState } from 'react'
import { IconChartArrows, IconCode, IconUsers } from '@tabler/icons-react'
import { GlassCard } from './glass_card'
import { Reveal } from './reveal'
import { useLanguage } from './language_provider'
import { scrollToSection } from '@/lib/scroll'
import type { CopyKey } from '@/lib/copy'

const markers: { key: CopyKey; Icon: typeof IconUsers }[] = [
  { key: 'markerOne', Icon: IconUsers },
  { key: 'markerTwo', Icon: IconCode },
  { key: 'markerThree', Icon: IconChartArrows },
]

export function Hero() {
  const { text } = useLanguage()

  return (
    <div className="flex min-h-[88svh] flex-col justify-end gap-12 pb-6 pt-28 md:grid md:grid-cols-[1.15fr_1fr] md:items-end md:gap-12 md:pb-10 md:pt-32">
      <div className="order-2 flex flex-col items-center gap-7 text-center md:order-1 md:items-start md:text-start">
        <Reveal>
          <GlassCard className="px-4 py-2">
            <span className="eyebrow">{text('heroEyebrow')}</span>
          </GlassCard>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="heading max-w-2xl text-balance text-4xl md:text-5xl lg:text-6xl">
            {text('heroHeadline')}
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="body_copy muted_on_dark max-w-xl text-pretty text-base leading-relaxed">
            {text('heroSubline')}
          </p>
        </Reveal>

        <Reveal delay={240} className="w-full">
          <ul className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8 md:justify-start">
            {markers.map(({ key, Icon }) => (
              <li key={key} className="flex flex-col items-center gap-2 md:items-start">
                <Icon size={24} stroke={1.5} style={{ color: 'var(--brand)' }} aria-hidden="true" />
                <span className="max-w-[9rem] text-pretty text-sm leading-relaxed">
                  {text(key)}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={320}>
          <button type="button" className="action" onClick={() => scrollToSection('register')}>
            {text('heroAction')}
          </button>
        </Reveal>
      </div>

      <div className="order-1 flex justify-center md:order-2 md:justify-end md:self-center">
        <Reveal>
          <HeroVisual />
        </Reveal>
      </div>
    </div>
  )
}

function HeroVisual() {
  const { text } = useLanguage()
  const [missing, setMissing] = useState(false)

  if (missing) {
    return (
      <div
        className="image_placeholder h-52 w-52 sm:h-64 sm:w-64 md:h-80 md:w-80"
        role="img"
        aria-label={text('heroVisualAlt')}
      />
    )
  }

  return (
    <Image
      src="/octopus_hero.png"
      alt={text('heroVisualAlt')}
      width={520}
      height={520}
      priority
      onError={() => setMissing(true)}
      className="h-52 w-52 object-contain sm:h-64 sm:w-64 md:h-80 md:w-80"
    />
  )
}
