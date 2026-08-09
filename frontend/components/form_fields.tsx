'use client'

// implements [S7.7] input behaviour and [S17.1] [S17.3] label and error binding

import { useLanguage } from './language_provider'
import type { CopyKey } from '@/lib/copy'

type Shared = {
  id: string
  label: string
  error?: CopyKey
  onBlur: () => void
}

function ErrorLine({ id, error }: { id: string; error?: CopyKey }) {
  const { text } = useLanguage()
  if (!error) return null
  return (
    <p id={`${id}_error`} className="field_error" role="alert">
      {text(error)}
    </p>
  )
}

export function TextField({
  id,
  label,
  error,
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  maxLength,
}: Shared & {
  value: string
  onChange: (next: string) => void
  type?: 'text' | 'email'
  autoComplete?: string
  maxLength?: number
}) {
  return (
    <div>
      <label className="field_label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="field_control"
        value={value}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}_error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      <ErrorLine id={id} error={error} />
    </div>
  )
}

export function SelectField({
  id,
  label,
  error,
  value,
  options,
  onChange,
  onBlur,
  autoComplete,
  placeholder,
}: Shared & {
  value: string
  // key is supplied when two entries share a value, as United States and
  // Canada both share the dial code 1
  options: { value: string; label: string; key?: string }[]
  onChange: (next: string) => void
  autoComplete?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="field_label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="field_control"
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}_error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.key ?? option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorLine id={id} error={error} />
    </div>
  )
}

/** implements [S7.7f] the number keeps left to right input direction in both languages */
export function PhoneField({
  id,
  label,
  error,
  value,
  onChange,
  onBlur,
}: Shared & {
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div>
      <label className="field_label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        dir="ltr"
        className="field_control phone_input"
        value={value}
        autoComplete="tel"
        maxLength={15}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}_error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      <ErrorLine id={id} error={error} />
    </div>
  )
}

export function RadioRow({
  id,
  label,
  error,
  value,
  options,
  onChange,
  onBlur,
}: Shared & {
  value: string
  options: { value: string; label: string }[]
  onChange: (next: string) => void
}) {
  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}_error` : undefined}
    >
      <legend className="field_label">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const inputId = `${id}_${option.value.toLowerCase()}`
          const selected = value === option.value
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              data-selected={selected}
              className="choice glass_light flex items-center gap-3 px-4 py-3"
            >
              <input
                id={inputId}
                type="radio"
                name={id}
                value={option.value}
                checked={selected}
                className="sr-only"
                onChange={() => onChange(option.value)}
                onBlur={onBlur}
              />
              <span className="dot" aria-hidden="true">
                <span className="dot_mark" />
              </span>
              <span className="value_strong text-sm font-medium">{option.label}</span>
            </label>
          )
        })}
      </div>
      <ErrorLine id={id} error={error} />
    </fieldset>
  )
}
