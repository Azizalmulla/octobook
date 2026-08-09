'use client'

// implements [S9] the gate, [S14.1] steps 1 to 10, and [S16] the edge cases

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SectionShell } from './section_shell'
import { GlassCard } from './glass_card'
import { Reveal } from './reveal'
import { SessionSelect } from './session_select'
import { RegistrationForm } from './registration_form'
import { PaymentBlock } from './payment_block'
import { useLanguage } from './language_provider'
import { ApiError, createRegistration, fetchRegistrationOptions, fetchSessions } from '@/lib/api_client'
import { FALLBACK_OPTIONS, FALLBACK_SESSIONS } from '@/lib/fallbacks'
import type { FormValues, RegistrationOptions, SessionItem } from '@/lib/types'
import type { CopyKey } from '@/lib/copy'
import {
  EMPTY_FORM,
  FIELD_KEYS,
  isGateOpen,
  mapServerFields,
  validateAll,
  type FieldErrorMap,
} from '@/lib/validation'

const FAILURE_COPY: Record<string, CopyKey> = {
  VALIDATION_FAILED: 'errorValidationFailed',
  SESSION_FULL: 'errorSessionFull',
  ALREADY_REGISTERED: 'errorAlreadyRegistered',
  RATE_LIMITED: 'errorRateLimited',
  PAYMENT_OPEN_FAILED: 'errorPaymentOpen',
  NETWORK_FAILED: 'errorNetwork',
  TIMEOUT: 'errorNetwork',
}

function newKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `key_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function RegistrationFlow() {
  const { text, lang } = useLanguage()

  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsFailed, setSessionsFailed] = useState(false)
  const [options, setOptions] = useState<RegistrationOptions>(FALLBACK_OPTIONS)

  const [sessionId, setSessionId] = useState('')
  const [sessionTouched, setSessionTouched] = useState(false)
  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [serverErrors, setServerErrors] = useState<FieldErrorMap>({})
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<CopyKey | undefined>(undefined)

  const idempotency = useRef<{ key: string; snapshot: string } | null>(null)

  // implements [S14.1] step 1, both requests in parallel
  useEffect(() => {
    let live = true

    void (async () => {
      const [sessionResult, optionResult] = await Promise.allSettled([
        fetchSessions(),
        fetchRegistrationOptions(),
      ])
      if (!live) return

      if (sessionResult.status === 'fulfilled' && sessionResult.value.length > 0) {
        setSessions(sessionResult.value)
      } else {
        // FALLBACK for local development only, per [S7.6] and [S2.5]
        setSessions(FALLBACK_SESSIONS)
        setSessionsFailed(false)
      }
      setSessionsLoading(false)

      if (optionResult.status === 'fulfilled' && optionResult.value?.fee) {
        setOptions(optionResult.value)
      }
    })()

    return () => {
      live = false
    }
  }, [])

  const liveErrors = useMemo(() => validateAll(values), [values])

  const shownErrors = useMemo<FieldErrorMap>(() => {
    const out: FieldErrorMap = {}
    for (const key of FIELD_KEYS) {
      const fromServer = serverErrors[key]
      if (fromServer) {
        out[key] = fromServer
        continue
      }
      if (touched[key] && liveErrors[key]) out[key] = liveErrors[key]
    }
    return out
  }, [liveErrors, serverErrors, touched])

  const selectedSession = sessions.find((item) => item.id === sessionId)
  const sessionSelectable = Boolean(
    selectedSession && selectedSession.isSelectable && selectedSession.seatsRemaining > 0,
  )
  const registrationClosed =
    sessions.length > 0 &&
    sessions.every((item) => !item.isSelectable || item.seatsRemaining <= 0)

  const gateOpen = isGateOpen({ values, sessionId, sessionSelectable, submitting })

  const handleChange = useCallback(
    <K extends keyof FormValues>(key: K, next: FormValues[K]) => {
      setValues((current) => ({ ...current, [key]: next }))
      setServerErrors((current) => {
        if (!current[key]) return current
        const copyOfErrors = { ...current }
        delete copyOfErrors[key]
        return copyOfErrors
      })
      setFailure(undefined)
    },
    [],
  )

  // implements [S7.7a] validation runs on blur, never before the first blur
  const handleBlur = useCallback((key: keyof FormValues) => {
    setTouched((current) => ({ ...current, [key]: true }))
  }, [])

  const handlePay = useCallback(async () => {
    setTouched(Object.fromEntries(FIELD_KEYS.map((key) => [key, true])))
    setSessionTouched(true)

    if (!isGateOpen({ values, sessionId, sessionSelectable, submitting })) return

    const snapshot = JSON.stringify({ values, sessionId })
    if (!idempotency.current || idempotency.current.snapshot !== snapshot) {
      idempotency.current = { key: newKey(), snapshot }
    }

    setSubmitting(true)
    setFailure(undefined)

    try {
      const created = await createRegistration({
        values,
        sessionId,
        language: lang,
        idempotencyKey: idempotency.current.key,
      })

      if (!created?.paymentLink) {
        setFailure('errorPaymentOpen')
        setSubmitting(false)
        return
      }

      // implements [S14.2] the identifier is kept so /return can read it back
      try {
        window.sessionStorage.setItem('octobook_track_id', created.trackId)
        window.sessionStorage.setItem('octobook_reference', created.reference)
      } catch {
        // storage is not available, the query string carries the identifier instead
      }

      window.location.href = created.paymentLink
    } catch (error) {
      if (error instanceof ApiError) {
        setServerErrors(mapServerFields(error.fields))
        setFailure(FAILURE_COPY[error.code] ?? 'errorGeneric')
      } else {
        setFailure('errorGeneric')
      }
      setSubmitting(false)
    }
  }, [lang, sessionId, sessionSelectable, submitting, values])

  return (
    <>
      <SectionShell id="sessions" ground="light" image="/sessions_bg.png">
        <Reveal className="flex flex-col gap-3">
          <h2 className="heading text-3xl md:text-4xl">{text('sessionsHeading')}</h2>
          <p className="muted_on_light text-sm">{text('sessionsHelper')}</p>
        </Reveal>
        <Reveal delay={90} className="mt-8">
          <SessionSelect
            sessions={sessions}
            value={sessionId}
            loading={sessionsLoading}
            failed={sessionsFailed}
            error={sessionTouched && !sessionId ? 'errorSession' : undefined}
            onSelect={(id) => {
              setSessionId(id)
              setFailure(undefined)
            }}
            onBlur={() => setSessionTouched(true)}
          />
        </Reveal>
      </SectionShell>

      <SectionShell id="register" ground="light" image="/form_bg.png">
        <Reveal className="flex flex-col gap-3">
          <h2 className="heading text-3xl md:text-4xl">{text('formHeading')}</h2>
          <p className="muted_on_light text-sm">{text('formHelper')}</p>
        </Reveal>
        <Reveal delay={90} className="mt-8">
          <GlassCard tone="light" className="p-6 md:p-9">
            <RegistrationForm
              values={values}
              errors={shownErrors}
              options={options}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </GlassCard>
        </Reveal>
      </SectionShell>

      <SectionShell id="payment" ground="dark" image="/payment_bg.png">
        <Reveal className="mb-8 text-center">
          <h2 className="heading text-3xl md:text-4xl">{text('paymentHeading')}</h2>
        </Reveal>
        <Reveal delay={90}>
          <PaymentBlock
            fee={options.fee}
            gateOpen={gateOpen}
            submitting={submitting}
            closed={registrationClosed}
            failure={failure}
            onPay={() => void handlePay()}
          />
        </Reveal>
      </SectionShell>
    </>
  )
}
