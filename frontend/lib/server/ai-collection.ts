import type { ServerEnv } from './env'
import { AppError } from './errors'

export type AiCollectionGatewayId = 1 | 2

export type CreatePaymentInput = {
  amount: string
  customerPhone: string
  customerName?: string
  customerEmail?: string
  language?: 'en' | 'ar'
  paymentGatewaysId?: AiCollectionGatewayId
  /** Server / browser notify URL (sync + WhatsApp) */
  callbackUrl?: string
  /** Browser landing page after pay (confirmation UI) */
  returnUrl?: string
  registrationId?: string
}

export type CreatePaymentResult = {
  success: boolean
  errors: unknown
  trackId: string
  paymentLink: string
  raw: unknown
}

export type PaymentStatusResult = {
  trackId: string
  isPaid: boolean
  status: string | null
  raw: unknown
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '')
  if (!digits) throw new AppError(400, 'WhatsApp number is invalid', 'INVALID_PHONE')
  return digits
}

function formatAmount(amount: string): string {
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) {
    throw new AppError(500, 'Invalid registration fee configuration', 'INVALID_AMOUNT')
  }
  return value.toFixed(3)
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return null
}

function detectPaid(raw: unknown): { isPaid: boolean; status: string | null } {
  const root = asRecord(raw)
  const nested = asRecord(root.data ?? root.payment ?? root.result ?? root.transaction ?? {})
  const status =
    pickString(nested, [
      'status',
      'payment_status',
      'Payment_status',
      'transaction_status',
      'Transaction_status',
      'result',
      'Result',
    ]) ??
    pickString(root, ['payment_status', 'Payment_status', 'transaction_status', 'Transaction_status'])

  if (nested.paid === true || nested.is_paid === true) {
    return { isPaid: true, status: status ?? 'paid' }
  }

  if (status) {
    const normalized = status.toLowerCase().trim()
    if (
      ['paid', 'success', 'successful', 'captured', 'completed', 'payment successful'].includes(
        normalized,
      )
    ) {
      return { isPaid: true, status }
    }
    if (
      ['link not used', 'pending', 'unpaid', 'not paid', 'awaiting payment', 'created'].includes(
        normalized,
      )
    ) {
      return { isPaid: false, status }
    }
    if (['failed', 'fail', 'cancelled', 'canceled', 'expired', 'declined'].includes(normalized)) {
      return { isPaid: false, status }
    }
  }

  // MyFatoorah payload nested inside AI Collection transaction_response
  const txnRaw = nested.transaction_response
  if (typeof txnRaw === 'string') {
    try {
      const txn = asRecord(JSON.parse(txnRaw))
      const data = asRecord(txn.Data)
      const invoiceStatus = pickString(data, ['InvoiceStatus', 'invoice_status'])
      if (invoiceStatus && invoiceStatus.toLowerCase() === 'paid') {
        return { isPaid: true, status: invoiceStatus }
      }
    } catch {
      // ignore parse errors
    }
  }

  return { isPaid: false, status }
}

export class AiCollectionClient {
  constructor(private readonly env: ServerEnv) {}

  private get token(): string {
    const token = this.env.AI_COLLECTION_BEARER_TOKEN.trim()
    if (!token) {
      throw new AppError(
        503,
        'AI Collection is not configured. Set AI_COLLECTION_BEARER_TOKEN.',
        'PAYMENT_NOT_CONFIGURED',
      )
    }
    return token
  }

  private async request(path: string, body: Record<string, unknown>): Promise<unknown> {
    const url = `${this.env.AI_COLLECTION_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      })
    } catch (error) {
      throw new AppError(502, 'Failed to reach AI Collection', 'PAYMENT_PROVIDER_UNREACHABLE', error)
    }

    const text = await response.text()
    let json: unknown = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = { raw: text }
    }

    if (!response.ok) {
      throw new AppError(
        502,
        `AI Collection request failed (${response.status})`,
        'PAYMENT_PROVIDER_ERROR',
        json,
      )
    }

    return json
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const body: Record<string, unknown> = {
      amount: formatAmount(input.amount),
      customer_phone: normalizePhone(input.customerPhone),
    }

    if (input.customerName) body.Customer_name = input.customerName
    if (input.customerEmail) body.customer_email = input.customerEmail
    if (input.language) body.language = input.language
    if (input.paymentGatewaysId) body.Payment_gateways_id = input.paymentGatewaysId
    // Override merchant defaults: server callback for sync, browser return for /return UI.
    const browserReturn = input.returnUrl || input.callbackUrl
    if (input.callbackUrl) {
      body.callback_url = input.callbackUrl
      body.CallbackUrl = input.callbackUrl
    }
    if (browserReturn) {
      body.return_url = browserReturn
      body.success_url = browserReturn
      body.ReturnUrl = browserReturn
      body.SuccessUrl = browserReturn
    }
    // Do not send udf/UserDefinedField: AI Collection requires 1-15 alphanumeric chars only.

    const raw = await this.request('create_payment', body)
    const data = asRecord(raw)

    const success = data.success === true || data.success === 'true' || data.success === 1
    const trackId = pickString(data, ['trackId', 'track_id', 'TrackId', 'id'])
    const paymentLink = pickString(data, ['payment_link', 'paymentLink', 'Payment_link', 'link'])

    if (!success || !trackId || !paymentLink) {
      throw new AppError(
        502,
        'AI Collection did not return a valid payment link',
        'PAYMENT_CREATE_FAILED',
        raw,
      )
    }

    return {
      success: true,
      errors: data.errors ?? false,
      trackId,
      paymentLink,
      raw,
    }
  }

  async getPaymentStatus(trackId: string): Promise<PaymentStatusResult> {
    const raw = await this.request('get_custom_payments', { trackId })
    const detected = detectPaid(raw)
    return {
      trackId,
      isPaid: detected.isPaid,
      status: detected.status,
      raw,
    }
  }
}
