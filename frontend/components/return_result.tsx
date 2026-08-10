'use client'

// implements [S13.4] [S14.1] steps 12 to 15 and [S16.2] [S16.8]
// The browser asks our own API for the payment result. It never asks the gateway.

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { IconCircleCheck, IconClock, IconLoader2, IconAlertTriangle } from '@tabler/icons-react'
import { GlassCard } from './glass_card'
import { SectionShell } from './section_shell'
import { Reveal } from './reveal'
import { useLanguage } from './language_provider'
import { ApiError, syncPayment, syncPaymentByRegistration } from '@/lib/api_client'
import type { PaymentStatus, PaymentSync } from '@/lib/types'
import type { CopyKey } from '@/lib/copy'

type Phase = 'checking' | 'result' | 'neutral'

const HEADINGS: Record<PaymentStatus, CopyKey> = {
  PAID: 'returnPaidHeading',
  PENDING_PAYMENT: 'returnPendingHeading',
  FAILED: 'returnFailedHeading',
  EXPIRED: 'returnFailedHeading',
}

const NOTES: Record<PaymentStatus, CopyKey> = {
  PAID: 'returnNotice',
  PENDING_PAYMENT: 'returnPendingNote',
  FAILED: 'returnFailedNote',
  EXPIRED: 'returnFailedNote',
}

// implements [S14.1] step 15: poll while the customer finishes checkout
const POLL_EVERY_MS = 3000
const POLL_MAX_MS = 180000

function readStorage(key: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.sessionStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

export function ReturnResult() {
  const { text, lang } = useLanguage()
  const params = useSearchParams()
  const [phase, setPhase] = useState<Phase>('checking')
  const [result, setResult] = useState<PaymentSync | null>(null)
  const [paymentLink, setPaymentLink] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const startedAt = useRef(0)

  const trackId = useMemo(() => {
    const fromQuery = params.get('trackId') ?? params.get('track_id')
    if (fromQuery) return fromQuery
    return readStorage('octobook_track_id')
  }, [params])

  const registrationId = useMemo(() => {
    const fromQuery =
      params.get('registrationId') ?? params.get('registration_id') ?? params.get('reference')
    if (fromQuery) return fromQuery
    return readStorage('octobook_registration_id') || readStorage('octobook_reference')
  }, [params])

  useEffect(() => {
    setPaymentLink(readStorage('octobook_payment_link'))
  }, [])

  useEffect(() => {
    if (!trackId && !registrationId) {
      setPhase('neutral')
      return
    }

    let live = true
    startedAt.current = Date.now()

    const run = async () => {
      try {
        const next = trackId
          ? await syncPayment(trackId)
          : await syncPaymentByRegistration(registrationId)
        if (!live) return
        setResult(next)
        setPhase('result')

        try {
          if (next.trackId) window.sessionStorage.setItem('octobook_track_id', next.trackId)
          if (next.reference) {
            window.sessionStorage.setItem('octobook_registration_id', next.reference)
            window.sessionStorage.setItem('octobook_reference', next.reference)
          }
        } catch {
          // ignore storage failures
        }

        const elapsed = Date.now() - startedAt.current
        if (next.status === 'PENDING_PAYMENT' && elapsed < POLL_MAX_MS) {
          timers.current.push(setTimeout(() => void run(), POLL_EVERY_MS))
        }
      } catch (error) {
        if (!live) return
        const elapsed = Date.now() - startedAt.current
        if (error instanceof ApiError && elapsed < POLL_MAX_MS) {
          timers.current.push(setTimeout(() => void run(), POLL_EVERY_MS))
          return
        }
        setPhase('neutral')
      }
    }

    void run()

    return () => {
      live = false
      for (const timer of timers.current) clearTimeout(timer)
      timers.current = []
    }
  }, [trackId, registrationId])

  return (
    <SectionShell id="return" ground="dark" image="/payment_bg.png" priority>
      <div className="flex min-h-[70svh] items-center justify-center">
        <Reveal className="w-full">
          <GlassCard className="mx-auto flex max-w-xl flex-col items-center gap-6 p-8 text-center md:p-10">
            {phase === 'checking' ? <Checking /> : null}
            {phase === 'neutral' ? <Neutral /> : null}
            {phase === 'result' && result ? <Result result={result} /> : null}

            {paymentLink && (phase === 'checking' || result?.status === 'PENDING_PAYMENT') ? (
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="action"
              >
                {text('returnOpenCheckout')}
              </a>
            ) : null}

            <Link href="/" className="action">
              {text('returnBackAction')}
            </Link>

            <span className="sr-only" aria-live="polite">
              {phase === 'checking'
                ? text('returnChecking')
                : result
                  ? text(HEADINGS[result.status])
                  : text('returnNeutralHeading')}
            </span>
          </GlassCard>
        </Reveal>
      </div>
    </SectionShell>
  )

  function Checking() {
    return (
      <div className="flex flex-col items-center gap-4">
        <IconLoader2
          size={34}
          stroke={1.6}
          className="spin"
          style={{ color: 'var(--brand)' }}
          aria-hidden="true"
        />
        <h1 className="heading text-2xl md:text-3xl">{text('returnChecking')}</h1>
        <p className="muted_on_dark text-pretty text-sm leading-relaxed">
          {text('returnCheckingNote')}
        </p>
      </div>
    )
  }

  function Neutral() {
    return (
      <div className="flex flex-col items-center gap-4">
        <IconAlertTriangle
          size={34}
          stroke={1.6}
          style={{ color: 'var(--brand)' }}
          aria-hidden="true"
        />
        <h1 className="heading text-2xl md:text-3xl">{text('returnNeutralHeading')}</h1>
        <p className="muted_on_dark text-pretty text-sm leading-relaxed">
          {text('returnNeutralNote')}
        </p>
      </div>
    )
  }

  function Result({ result: found }: { result: PaymentSync }) {
    const Icon =
      found.status === 'PAID'
        ? IconCircleCheck
        : found.status === 'PENDING_PAYMENT'
          ? IconClock
          : IconAlertTriangle

    // implements [S1.4] [S13.4]: confirmation and payment number only when PAID
    const rows: { label: CopyKey; value: string }[] = []
    if (found.status === 'PAID' && found.reference) {
      rows.push({ label: 'returnPaymentNumber', value: found.reference })
    } else if (found.status === 'PENDING_PAYMENT' && found.reference) {
      // implements [S14.1] pending screen keeps the reference without claiming success
      rows.push({ label: 'returnPaymentNumber', value: found.reference })
    }
    if (found.status === 'PAID' && found.session) {
      rows.push({
        label: 'returnSession',
        value: lang === 'ar' ? found.session.labelAr : found.session.labelEn,
      })
    }
    if (found.status === 'PAID' && found.amount) {
      rows.push({
        label: 'returnAmount',
        value: `${found.amount} ${found.currency ?? ''}`.trim(),
      })
    }

    return (
      <div className="flex w-full flex-col items-center gap-6">
        <Icon size={38} stroke={1.6} style={{ color: 'var(--brand)' }} aria-hidden="true" />
        <h1 className="heading text-2xl md:text-3xl">{text(HEADINGS[found.status])}</h1>

        {found.status === 'PAID' && found.reference ? (
          <p className="price text-xl md:text-2xl">
            {text('returnPaymentNumber')} {found.reference}
          </p>
        ) : null}

        {rows.length > 0 && found.status !== 'PAID' ? (
          <dl className="flex w-full flex-col gap-3 text-start">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                style={{ borderColor: 'color-mix(in srgb, var(--neutral) 16%, transparent)' }}
              >
                <dt className="muted_on_dark text-xs">{text(row.label)}</dt>
                <dd className="text-sm font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {found.status === 'PAID' ? (
          <dl className="flex w-full flex-col gap-3 text-start">
            {rows
              .filter((row) => row.label !== 'returnPaymentNumber')
              .map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  style={{ borderColor: 'color-mix(in srgb, var(--neutral) 16%, transparent)' }}
                >
                  <dt className="muted_on_dark text-xs">{text(row.label)}</dt>
                  <dd className="text-sm font-medium">{row.value}</dd>
                </div>
              ))}
          </dl>
        ) : null}

        <p className="muted_on_dark text-pretty text-sm leading-relaxed">
          {text(NOTES[found.status])}
        </p>
      </div>
    )
  }
}
