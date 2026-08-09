// implements [S7.3] field rules, [S7.7] behaviour, and [S9.2] the payment gate

import type { CopyKey } from './copy'
import { digitsOnly, normaliseNationalNumber } from './phone'
import type { FieldKey, FormValues } from './types'

export type FieldErrorMap = Partial<Record<FieldKey, CopyKey>>

export const EMPTY_FORM: FormValues = {
  full_name: '',
  whatsapp_country_code: '965',
  whatsapp_number: '',
  email: '',
  company_name: '',
  country: 'KW',
  business_type: '',
  has_b2b_clients: '',
  build_goal: '',
}

const NAME_SHAPE = /^[\p{L}\p{M}'\s]+$/u
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Rule = (values: FormValues) => CopyKey | null

const rules: Record<FieldKey, Rule> = {
  full_name: (v) => {
    const value = v.full_name.trim()
    const valid =
      value.length >= 3 &&
      value.length <= 120 &&
      value.includes(' ') &&
      NAME_SHAPE.test(value) &&
      !/\d/.test(value)
    return valid ? null : 'errorFullName'
  },
  whatsapp_country_code: (v) => (digitsOnly(v.whatsapp_country_code).length >= 1 ? null : 'errorCountryCode'),
  whatsapp_number: (v) => {
    const national = normaliseNationalNumber(v.whatsapp_number)
    return national.length >= 6 && national.length <= 12 ? null : 'errorWhatsapp'
  },
  email: (v) => {
    const value = v.email.trim().toLowerCase()
    return value.length <= 180 && EMAIL_SHAPE.test(value) ? null : 'errorEmail'
  },
  company_name: (v) => {
    const value = v.company_name.trim()
    return value.length >= 2 && value.length <= 120 ? null : 'errorCompany'
  },
  country: (v) => (/^[A-Z]{2}$/.test(v.country) ? null : 'errorCountry'),
  business_type: (v) => (v.business_type.length > 0 ? null : 'errorBusinessType'),
  has_b2b_clients: (v) => (v.has_b2b_clients === 'YES' || v.has_b2b_clients === 'NO' ? null : 'errorB2b'),
  build_goal: (v) => (v.build_goal.length > 0 ? null : 'errorBuildGoal'),
}

export const FIELD_KEYS = Object.keys(rules) as FieldKey[]

export function validateField(key: FieldKey, values: FormValues): CopyKey | null {
  return rules[key](values)
}

export function validateAll(values: FormValues): FieldErrorMap {
  const found: FieldErrorMap = {}
  for (const key of FIELD_KEYS) {
    const error = rules[key](values)
    if (error) found[key] = error
  }
  return found
}

export function isFormComplete(values: FormValues): boolean {
  return Object.keys(validateAll(values)).length === 0
}

/**
 * implements [S9.2] payment gate.
 * Open only when every field passes, exactly one selectable session is chosen,
 * and no submission is already in flight.
 */
export function isGateOpen(input: {
  values: FormValues
  sessionId: string
  sessionSelectable: boolean
  submitting: boolean
}): boolean {
  return (
    isFormComplete(input.values) &&
    input.sessionId.length > 0 &&
    input.sessionSelectable &&
    !input.submitting
  )
}

/** Maps a backend field error map onto the form keys used on screen. */
export function mapServerFields(fields: Record<string, string> | undefined): FieldErrorMap {
  if (!fields) return {}
  const bridge: Record<string, FieldKey> = {
    fullName: 'full_name',
    full_name: 'full_name',
    whatsappCountryCode: 'whatsapp_country_code',
    whatsappNumber: 'whatsapp_number',
    email: 'email',
    companyName: 'company_name',
    country: 'country',
    businessType: 'business_type',
    hasB2bClients: 'has_b2b_clients',
    buildGoal: 'build_goal',
  }
  const messages: Record<string, CopyKey> = {
    EMAIL_INVALID: 'errorEmail',
    PHONE_INVALID: 'errorWhatsapp',
    NAME_INVALID: 'errorFullName',
    COMPANY_INVALID: 'errorCompany',
    COUNTRY_INVALID: 'errorCountry',
    BUSINESS_TYPE_INVALID: 'errorBusinessType',
    BUILD_GOAL_INVALID: 'errorBuildGoal',
    B2B_INVALID: 'errorB2b',
  }
  const out: FieldErrorMap = {}
  for (const [rawKey, rawCode] of Object.entries(fields)) {
    const key = bridge[rawKey]
    if (!key) continue
    out[key] = messages[rawCode] ?? 'errorValidationFailed'
  }
  return out
}
