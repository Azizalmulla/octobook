// implements [S5.7] smooth scroll with a soft fade during travel, both platforms

export function scrollToSection(id: string): void {
  const target = document.getElementById(id)
  if (!target) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const shell = document.getElementById('page_shell')

  if (reduced) {
    target.scrollIntoView({ behavior: 'auto', block: 'start' })
    return
  }

  shell?.classList.add('travelling')
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })

  window.setTimeout(() => {
    shell?.classList.remove('travelling')
  }, 620)
}

/** Scroll to the first incomplete control and move keyboard focus there. */
export function scrollToAndFocus(id: string): void {
  const target = document.getElementById(id)
  if (!target) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })

  const focusable = (
    target.matches('input, select, textarea, button')
      ? target
      : target.querySelector('input:not([type="hidden"]), select, textarea, button')
  ) as HTMLElement | null

  window.setTimeout(
    () => {
      focusable?.focus({ preventScroll: true })
    },
    reduced ? 0 : 380,
  )
}
