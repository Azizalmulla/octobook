import type { ServerEnv } from './env'
import { AppError } from './errors'

export type WhatsappTemplateParams = {
  to: string
  name: string
  registrationNumber: string
  dateAr: string
  dateEn: string
  time: string
  amountKwd: string
  locale?: string
}

function normalizeWhatsappTo(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '')
  if (digits.length < 8) {
    throw new AppError(400, 'WhatsApp number is invalid', 'INVALID_WHATSAPP')
  }
  return digits
}

function textParam(text: string) {
  return { type: 'text' as const, text }
}

export class WhatsappTemplateClient {
  constructor(private readonly env: ServerEnv) {}

  private tokenFor(locale?: string): string {
    const arabic = this.env.WHATSAPP_TEMPLATE_TOKEN_AR.trim()
    const english = this.env.WHATSAPP_TEMPLATE_TOKEN.trim()
    // Bilingual confirmation template lives on the primary token.
    // AR token only used when explicitly set as a separate template.
    if (locale === 'ar' && arabic) return arabic
    return english
  }

  private get enabled(): boolean {
    return Boolean(this.env.WHATSAPP_TEMPLATE_TOKEN.trim() || this.env.WHATSAPP_TEMPLATE_TOKEN_AR.trim())
  }

  async sendRegistrationConfirmed(input: WhatsappTemplateParams): Promise<{ raw: unknown }> {
    const token = this.tokenFor(input.locale)
    if (!this.enabled || !token) {
      throw new AppError(
        503,
        'WhatsApp is not configured. Set WHATSAPP_TEMPLATE_TOKEN.',
        'WHATSAPP_NOT_CONFIGURED',
      )
    }

    // Template body (AR + EN in one message):
    // {{1}} name AR, {{2}} reg #, {{3}} date AR, {{4}} time, {{5}} amount
    // {{6}} name EN, {{7}} reg #, {{8}} date EN, {{9}} time, {{10}} amount
    const body = {
      token,
      required: {
        to: normalizeWhatsappTo(input.to),
        data: [
          {
            type: 'body',
            parameters: [
              textParam(input.name),
              textParam(input.registrationNumber),
              textParam(input.dateAr),
              textParam(input.time),
              textParam(input.amountKwd),
              textParam(input.name),
              textParam(input.registrationNumber),
              textParam(input.dateEn),
              textParam(input.time),
              textParam(input.amountKwd),
            ],
          },
        ],
      },
      isToken: true,
    }

    let response: Response
    try {
      response = await fetch(this.env.WHATSAPP_TEMPLATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      })
    } catch (error) {
      throw new AppError(502, 'Failed to reach WhatsApp template API', 'WHATSAPP_UNREACHABLE', error)
    }

    const text = await response.text()
    let json: unknown = text
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = { raw: text }
    }

    if (!response.ok) {
      throw new AppError(
        502,
        `WhatsApp template send failed (${response.status})`,
        'WHATSAPP_SEND_FAILED',
        json,
      )
    }

    return { raw: json }
  }
}
