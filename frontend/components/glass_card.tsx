// implements [S5.2] and [S5.10] the single glass surface used by every panel

import { cn } from '@/lib/utils'

type GlassCardProps = {
  tone?: 'dark' | 'light'
  id?: string
  className?: string
  children: React.ReactNode
}

export function GlassCard({ tone = 'dark', id, className, children }: GlassCardProps) {
  return (
    <div
      id={id}
      className={cn(tone === 'light' ? 'glass_light' : 'glass', 'rounded-3xl', className)}
    >
      {children}
    </div>
  )
}
