// implements [S6] the single page order: hero, sessions, form, payment, footer

import { SectionShell } from '@/components/section_shell'
import { Hero } from '@/components/hero'
import { RegistrationFlow } from '@/components/registration_flow'
import { FooterLine } from '@/components/footer_line'

export default function Page() {
  return (
    <main>
      <SectionShell id="hero" ground="dark" image="/hero_bg.png" priority>
        <Hero />
      </SectionShell>

      <RegistrationFlow />

      <FooterLine />
    </main>
  )
}
