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
  sessionLabel,
  onPay,
}: {
  fee: Fee
  gateOpen: boolean
  submitting: boolean
  closed: boolean
  failure?: CopyKey
  sessionLabel?: string
  onPay: () => void
}) {
  const { text, lang } = useLanguage()
  const blocked = closed || submitting

  return (
    <GlassCard tone="light" className="checkout_panel mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="flex flex-col gap-2 text-start">
          <span className="eyebrow">{text('paymentEyebrow')}</span>
          <span className="price text-4xl md:text-5xl">
            {lang === 'ar' ? fee.labelAr : fee.labelEn}
          </span>
          <span className="muted_on_light text-sm">{text('paymentSeatLine')}</span>
          {sessionLabel ? (
            <p className="value_strong mt-1 text-sm font-medium">{sessionLabel}</p>
          ) : (
            <p className="muted_on_light mt-1 text-sm">{text('paymentNoSession')}</p>
          )}
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:min-w-[16rem] md:items-end">
          <button
            type="button"
            className="action flex w-full items-center justify-center gap-2 md:w-auto"
            aria-disabled={blocked}
            disabled={blocked}
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
          <p className="muted_on_light max-w-xs text-pretty text-xs leading-relaxed md:text-end">
            {closed
              ? text('registrationClosed')
              : gateOpen
                ? text('paymentReadyLine')
                : text('paymentGateLine')}
          </p>
        </div>
      </div>

      {failure ? (
        <p className="text-sm font-medium" role="alert">
          {text(failure)}
        </p>
      ) : null}

      <p className="muted_on_light max-w-xl text-pretty text-xs leading-relaxed">
        {text('paymentSecureNote')}
      </p>
    </GlassCard>
  )
}
