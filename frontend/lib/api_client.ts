// implements [S11.6] one api client module. No component calls fetch directly.
// The browser never speaks to the payment gateway and never carries a token.

import type {
  CreatedRegistration,
  FormValues,
  Lang,
  PaymentSync,
  RegistrationOptions,
  SessionItem,
} from './types'
import { normaliseNationalNumber, digitsOnly } from './phone'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
const TIMEOUT_MS = 20000

export class ApiError extends Error {
  code: string
  status: number
  fields?: Record<string, string>

  constructor(code: string, status: number, fields?: Record<string, string>) {
    super(code)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.fields = fields
  }
}

type RequestInput = {
  path: string
  method: 'GET' | 'POST'
  body?: unknown
}

async function request<T>({ path, method, body }: RequestInput): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    })

    const text = await response.text()
    const payload = text ? (JSON.parse(text) as Record<string, unknown>) : {}

    if (!response.ok) {
      const code = typeof payload.error === 'string' ? payload.error : 'REQUEST_FAILED'
      const fields = payload.fields as Record<string, string> | undefined
      throw new ApiError(code, response.status, fields)
    }

    return payload as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 0)
    }
    throw new ApiError('NETWORK_FAILED', 0)
  } finally {
    clearTimeout(timer)
  }
}

/** GET requests get one retry on a network failure. POST requests never retry. */
async function getWithOneRetry<T>(path: string): Promise<T> {
  try {
    return await request<T>({ path, method: 'GET' })
  } catch (error) {
    if (error instanceof ApiError && (error.code === 'NETWORK_FAILED' || error.code === 'TIMEOUT')) {
      return request<T>({ path, method: 'GET' })
    }
    throw error
  }
}

// implements [S11.1]
export async function fetchSessions(): Promise<SessionItem[]> {
  const data = await getWithOneRetry<{ sessions: SessionItem[] }>('/api/sessions')
  return data.sessions ?? []
}

// implements [S11.2]
export async function fetchRegistrationOptions(): Promise<RegistrationOptions> {
  return getWithOneRetry<RegistrationOptions>('/api/meta/registration-options')
}

// implements [S11.3]. The client never sends an amount, per [S9.5] and [S15.3].
export async function createRegistration(input: {
  values: FormValues
  sessionId: string
  language: Lang
  idempotencyKey: string
}): Promise<CreatedRegistration> {
  const { values } = input
  return request<CreatedRegistration>({
    path: '/api/registrations',
    method: 'POST',
    body: {
      fullName: values.full_name.trim(),
      whatsappCountryCode: digitsOnly(values.whatsapp_country_code),
      whatsappNumber: normaliseNationalNumber(values.whatsapp_number),
      email: values.email.trim().toLowerCase(),
      companyName: values.company_name.trim(),
      country: values.country,
      businessType: values.business_type,
      hasB2bClients: values.has_b2b_clients === 'YES',
      buildGoal: values.build_goal,
      sessionId: input.sessionId,
      language: input.language,
      idempotencyKey: input.idempotencyKey,
    },
  })
}

// implements [S11.4]
export async function syncPayment(trackId: string): Promise<PaymentSync> {
  return request<PaymentSync>({
    path: `/api/payments/${encodeURIComponent(trackId)}/sync`,
    method: 'POST',
  })
}
