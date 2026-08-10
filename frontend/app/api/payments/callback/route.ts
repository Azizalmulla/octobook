import { NextResponse } from 'next/server'
import { getAppUrl, getServerEnv } from '@/lib/server/env'
import { jsonError } from '@/lib/server/http'
import { prisma } from '@/lib/server/prisma'
import { RegistrationService } from '@/lib/server/registration-service'

export const runtime = 'nodejs'

function firstString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (Array.isArray(value) && value.length > 0) return firstString(value[0])
  return null
}

function pickFromRecord(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    if (key in record) {
      const found = firstString(record[key])
      if (found) return found
    }
    const lower = key.toLowerCase()
    for (const [entryKey, entryValue] of Object.entries(record)) {
      if (entryKey.toLowerCase() === lower) {
        const found = firstString(entryValue)
        if (found) return found
      }
    }
  }
  return null
}

const REGISTRATION_KEYS = ['registrationId', 'registration_id', 'udf', 'Udf', 'UserDefinedField']
const TRACK_KEYS = ['trackId', 'track_id', 'TrackId', 'trackid', 'paymentId', 'PaymentId']

function readStorage(key: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.sessionStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

async function readBodyRecord(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''

  if (contentType.includes('application/json')) {
    try {
      const json = (await request.json()) as unknown
      return typeof json === 'object' && json !== null ? (json as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    try {
      const form = await request.formData()
      const out: Record<string, unknown> = {}
      form.forEach((value, key) => {
        out[key] = typeof value === 'string' ? value : value.name
      })
      return out
    } catch {
      return {}
    }
  }

  // Some gateways POST with no/odd content-type; try text then URLSearchParams.
  try {
    const text = await request.text()
    if (!text.trim()) return {}
    try {
      const json = JSON.parse(text) as unknown
      if (typeof json === 'object' && json !== null) return json as Record<string, unknown>
    } catch {
      const params = new URLSearchParams(text)
      const out: Record<string, unknown> = {}
      params.forEach((value, key) => {
        out[key] = value
      })
      return out
    }
  } catch {
    return {}
  }

  return {}
}

async function handleCallback(request: Request) {
  try {
    const url = new URL(request.url)
    const queryRecord = Object.fromEntries(url.searchParams.entries()) as Record<string, unknown>
    const bodyRecord = request.method === 'POST' ? await readBodyRecord(request) : {}

    let registrationId =
      pickFromRecord(queryRecord, REGISTRATION_KEYS) ?? pickFromRecord(bodyRecord, REGISTRATION_KEYS)
    let trackId = pickFromRecord(queryRecord, TRACK_KEYS) ?? pickFromRecord(bodyRecord, TRACK_KEYS)

    const service = new RegistrationService(getServerEnv())
    let syncedTrackId = trackId
    let syncedRegistrationId = registrationId

    if (registrationId) {
      const result = await service.syncPaymentByRegistrationId(registrationId)
      syncedTrackId = result.trackId || syncedTrackId
      syncedRegistrationId = result.reference || registrationId
    } else if (trackId) {
      const result = await service.syncPaymentByTrackId(trackId)
      syncedTrackId = result.trackId || trackId
      syncedRegistrationId = result.reference || null
    } else {
      return NextResponse.redirect(`${getAppUrl()}/return`, { status: 303 })
    }

    if (!syncedTrackId && syncedRegistrationId) {
      const payment = await prisma.payment.findFirst({
        where: { registrationId: syncedRegistrationId },
        select: { trackId: true },
      })
      syncedTrackId = payment?.trackId ?? null
    }

    const returnUrl = new URL(`${getAppUrl()}/return`)
    if (syncedTrackId) returnUrl.searchParams.set('trackId', syncedTrackId)
    if (syncedRegistrationId) returnUrl.searchParams.set('registrationId', syncedRegistrationId)
    return NextResponse.redirect(returnUrl.toString(), { status: 303 })
  } catch (error) {
    return jsonError(error)
  }
}

export async function GET(request: Request) {
  return handleCallback(request)
}

export async function POST(request: Request) {
  return handleCallback(request)
}
