// implements [S18.2d] unit coverage for the payment gate rule in [S9.2]

import { describe, expect, it } from 'vitest'
import { EMPTY_FORM, isGateOpen } from '../validation'
import type { FormValues } from '../types'

const validValues: FormValues = {
  full_name: 'Aziz Al Mulla',
  whatsapp_country_code: '965',
  whatsapp_number: '99112233',
  email: 'aziz@example.com',
  company_name: 'Octopus Ai',
  country: 'KW',
  business_type: 'AI_AUTOMATION',
  has_b2b_clients: 'YES',
  build_goal: 'OWN_PLATFORM',
}

describe('isGateOpen', () => {
  it('stays closed when a field is empty', () => {
    expect(
      isGateOpen({
        values: EMPTY_FORM,
        sessionId: 'session_1',
        sessionSelectable: true,
        submitting: false,
      }),
    ).toBe(false)
  })

  it('stays closed when no session is selected', () => {
    expect(
      isGateOpen({
        values: validValues,
        sessionId: '',
        sessionSelectable: true,
        submitting: false,
      }),
    ).toBe(false)
  })

  it('stays closed when the session is not selectable', () => {
    expect(
      isGateOpen({
        values: validValues,
        sessionId: 'session_1',
        sessionSelectable: false,
        submitting: false,
      }),
    ).toBe(false)
  })

  it('stays closed while a submission is in flight', () => {
    expect(
      isGateOpen({
        values: validValues,
        sessionId: 'session_1',
        sessionSelectable: true,
        submitting: true,
      }),
    ).toBe(false)
  })

  it('opens only when every gate condition is true', () => {
    expect(
      isGateOpen({
        values: validValues,
        sessionId: 'session_1',
        sessionSelectable: true,
        submitting: false,
      }),
    ).toBe(true)
  })
})
