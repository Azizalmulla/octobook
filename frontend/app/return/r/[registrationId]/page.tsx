// implements [S6.1] [S14] payment return with registration id in the path
// (AI Collection strips query-string ids from callback/return URLs)

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ReturnResult } from '@/components/return_result'
import { FooterLine } from '@/components/footer_line'

export const metadata: Metadata = {
  title: 'Payment Result | Octopus Ai',
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ registrationId: string }> }

export default async function ReturnByRegistrationPage({ params }: Props) {
  const { registrationId } = await params

  return (
    <main>
      <Suspense fallback={<div className="ground_dark min-h-[70svh]" />}>
        <ReturnResult forcedRegistrationId={registrationId} />
      </Suspense>
      <FooterLine />
    </main>
  )
}
