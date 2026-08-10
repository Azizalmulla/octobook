'use client'

// implements [S6.4] and [S8] two radio cards, exactly one selectable at a time

import { IconCalendarEvent, IconClock, IconLoader2 } from '@tabler/icons-react'
import { useLanguage } from './language_provider'
import type { SessionItem } from '@/lib/types'
import type { CopyKey } from '@/lib/copy'

export function SessionSelect({
  sessions,
  value,
  loading,
  failed,
  error,
  onSelect,
  onBlur,
}: {
  sessions: SessionItem[]
  value: string
  loading: boolean
  failed: boolean
  error?: CopyKey
  onSelect: (id: string) => void
  onBlur: () => void
}) {
  const { text, lang } = useLanguage()
  const locale = lang === 'ar' ? 'ar-KW' : 'en-GB'

  if (loading) {
    return (
      <p className="muted_on_light flex items-center gap-2 text-sm">
        <IconLoader2 size={18} stroke={1.5} className="spin" style={{ color: 'var(--brand)' }} />
        {text('sessionsLoading')}
      </p>
    )
  }

  if (failed || sessions.length === 0) {
    return (
      <p className="field_error" role="alert">
        {text('sessionsFailed')}
      </p>
    )
  }

  return (
    <div id="session_select">
      <div
        role="radiogroup"
        aria-label={text('sessionsHeading')}
        className="grid gap-4 sm:grid-cols-2"
      >
        {sessions.map((session) => {
          const selectable = session.isSelectable && session.seatsRemaining > 0
          const selected = value === session.id
          const inputId = `session_${session.code.toLowerCase()}`
          const start = new Intl.DateTimeFormat(locale, {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: session.timezone || 'Asia/Kuwait',
          }).format(new Date(session.startsAt))
          const end = new Intl.DateTimeFormat(locale, {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: session.timezone || 'Asia/Kuwait',
          }).format(new Date(session.endsAt))

          return (
            <label
              key={session.id}
              htmlFor={inputId}
              data-selected={selected}
              data-disabled={!selectable}
              className="choice glass_light flex items-start gap-4 p-5"
            >
              <input
                id={inputId}
                type="radio"
                name="session_id"
                value={session.id}
                checked={selected}
                disabled={!selectable}
                className="sr-only"
                onChange={() => onSelect(session.id)}
                onBlur={onBlur}
              />
              <span className="dot mt-1" aria-hidden="true">
                <span className="dot_mark" />
              </span>
              <span className="flex flex-col gap-2">
                <span className="value_strong flex items-center gap-2 text-base font-semibold">
                  <IconCalendarEvent
                    size={18}
                    stroke={1.5}
                    style={{ color: 'var(--brand)' }}
                    aria-hidden="true"
                  />
                  {lang === 'ar' ? session.labelAr : session.labelEn}
                </span>
                <span className="muted_on_light flex items-center gap-2 text-sm">
                  <IconClock
                    size={16}
                    stroke={1.5}
                    style={{ color: 'var(--brand)' }}
                    aria-hidden="true"
                  />
                  <span dir="ltr">{`${start} ${text('timeRange')} ${end}`}</span>
                  <span dir="ltr">{text('timezoneNote')}</span>
                </span>
                <span className="muted_on_light text-xs font-medium">
                  {selectable
                    ? `${session.seatsRemaining} ${text('seatsLeft')}`
                    : text('soldOut')}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      {error ? (
        <p id="session_id_error" className="field_error" role="alert">
          {text(error)}
        </p>
      ) : null}
    </div>
  )
}
