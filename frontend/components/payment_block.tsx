'use client'

// implements [S9.2] the gate, [S9.3] double submission protection, and [S9.5] the fee

import { IconLoader2, IconLock } from '@tabler/icons-react'
import { GlassCard } from './glass_card'
import { useLanguage } from './language_provider'
import type { Fee } from '@/lib/types'
import type { CopyKey } from '@/lib/copy'

export function PaymentBlock({
  fee,
  gateOpen,
  submitting,
  closed,
  failure,
  onPay,
}: {
  fee: Fee
  gateOpen: boolean
  submitting: boolean
  closed: boolean
  failure?: CopyKey
  onPay: () => void
}) {
  const { text, lang } = useLanguage()
  const disabled = !gateOpen || closed

  return (
    <GlassCard className="mx-auto flex max-w-2xl flex-col items-center gap-6 p-8 md:p-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="price text-4xl md:text-5xl">
          {lang === 'ar' ? fee.labelAr : fee.labelEn}
        </span>
        <span className="muted_on_dark text-sm">{text('paymentSeatLine')}</span>
      </div>

      <p className="muted_on_dark max-w-md text-pretty text-center text-sm leading-relaxed">
        {closed
          ? text('registrationClosed')
          : gateOpen
            ? text('paymentReadyLine')
            : text('paymentGateLine')}
      </p>

      <button
        type="button"
        className="action flex items-center gap-2"
        aria-disabled={disabled || submitting}
        disabled={disabled || submitting}
        onClick={onPay}
      >
        {submitting ? (
          <>
            <IconLoader2 size={18} stroke={1.8} className="spin" aria-hidden="true" />
            {text('paymentWorking')}
          </>
        ) : (
          <>
            <IconLock size={18} stroke={1.8} aria-hidden="true" />
            {text('paymentAction')}
          </>
        )}
      </button>

      {failure ? (
        <p className="text-center text-sm font-medium" role="alert">
          {text(failure)}
        </p>
      ) : null}

      <p className="muted_on_dark max-w-sm text-pretty text-center text-xs leading-relaxed">
        {text('paymentSecureNote')}
      </p>
    </GlassCard>
  )
}
