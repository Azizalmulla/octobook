// implements [S6.6] one background image per section and [S17.5] the token scrim

import Image from 'next/image'
import { cn } from '@/lib/utils'

type SectionShellProps = {
  id: string
  ground: 'dark' | 'light'
  image: string
  priority?: boolean
  className?: string
  children: React.ReactNode
}

export function SectionShell({
  id,
  ground,
  image,
  priority = false,
  className,
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative isolate overflow-hidden',
        ground === 'dark' ? 'ground_dark' : 'ground_light',
        className,
      )}
    >
      <Image
        src={image}
        alt=""
        aria-hidden="true"
        fill
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        sizes="100vw"
        className="pointer-events-none absolute inset-0 object-cover"
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0',
          ground === 'dark' ? 'scrim_dark' : 'scrim_light',
        )}
      />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-24">{children}</div>
    </section>
  )
}
