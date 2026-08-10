const TRACK_KEY = 'octobook_track_id'
const REG_KEY = 'octobook_registration_id'
const REF_KEY = 'octobook_reference'
const LINK_KEY = 'octobook_payment_link'

export type PaymentHandoff = {
  trackId: string
  registrationId: string
  paymentLink: string
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined'
}

function write(storage: Storage, handoff: PaymentHandoff) {
  storage.setItem(TRACK_KEY, handoff.trackId)
  storage.setItem(REG_KEY, handoff.registrationId)
  storage.setItem(REF_KEY, handoff.registrationId)
  storage.setItem(LINK_KEY, handoff.paymentLink)
}

function read(storage: Storage): Partial<PaymentHandoff> {
  return {
    trackId: storage.getItem(TRACK_KEY) ?? '',
    registrationId: storage.getItem(REG_KEY) || storage.getItem(REF_KEY) || '',
    paymentLink: storage.getItem(LINK_KEY) ?? '',
  }
}

/**
 * AI Collection docs only give trackId + get_custom_payments — no return URL params.
 * Their merchant callback is a fixed bare URL, so the checkout tab comes back with no id.
 * localStorage is shared across tabs on our origin; sessionStorage is not.
 */
export function savePaymentHandoff(handoff: PaymentHandoff) {
  if (!canUseStorage()) return
  try {
    write(window.localStorage, handoff)
  } catch {
    // private mode / blocked
  }
  try {
    write(window.sessionStorage, handoff)
  } catch {
    // ignore
  }
}

export function readPaymentHandoff(): PaymentHandoff {
  if (!canUseStorage()) {
    return { trackId: '', registrationId: '', paymentLink: '' }
  }

  try {
    const local = read(window.localStorage)
    if (local.trackId || local.registrationId) {
      return {
        trackId: local.trackId || '',
        registrationId: local.registrationId || '',
        paymentLink: local.paymentLink || '',
      }
    }
  } catch {
    // ignore
  }

  try {
    const session = read(window.sessionStorage)
    return {
      trackId: session.trackId || '',
      registrationId: session.registrationId || '',
      paymentLink: session.paymentLink || '',
    }
  } catch {
    return { trackId: '', registrationId: '', paymentLink: '' }
  }
}
