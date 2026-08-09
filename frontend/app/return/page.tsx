// implements [S6.1] [S14] the payment return page

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ReturnResult } from '@/components/return_result'
import { FooterLine } from '@/components/footer_line'

export const metadata: Metadata = {
  title: 'Payment Result | Octopus Ai',
  robots: { index: false, follow: false },
}

export default function ReturnPage() {
  return (
    <main>
      <Suspense fallback={<div className="ground_dark min-h-[70svh]" />}>
        <ReturnResult />
      </Suspense>
      <FooterLine />
    </main>
  )
}
