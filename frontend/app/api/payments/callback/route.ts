import { NextResponse } from 'next/server'
import { getAppUrl, getServerEnv } from '@/lib/server/env'
import { jsonError } from '@/lib/server/http'
import { prisma } from '@/lib/server/prisma'
import { RegistrationService } from '@/lib/server/registration-service'

export const runtime = 'nodejs'

async function handleCallback(request: Request) {
  try {
    const url = new URL(request.url)
    let registrationId = url.searchParams.get('registrationId') ?? url.searchParams.get('udf')
    let trackId = url.searchParams.get('trackId') ?? url.searchParams.get('track_id')

    if (request.method === 'POST') {
      try {
        const body = (await request.json()) as Record<string, unknown>
        if (!registrationId && typeof body.registrationId === 'string') {
          registrationId = body.registrationId
        }
        if (!registrationId && typeof body.udf === 'string') registrationId = body.udf
        if (!trackId && typeof body.trackId === 'string') trackId = body.trackId
        if (!trackId && typeof body.track_id === 'string') trackId = body.track_id
      } catch {
        // body may be empty or form-encoded; query params are enough
      }
    }

    const service = new RegistrationService(getServerEnv())
    let syncedTrackId = trackId

    if (registrationId) {
      const result = await service.syncPaymentByRegistrationId(registrationId)
      syncedTrackId = result.trackId
    } else if (trackId) {
      await service.syncPaymentByTrackId(trackId)
    } else {
      return NextResponse.redirect(`${getAppUrl()}/return`, { status: 303 })
    }

    // If only registrationId was given, resolve track id for the return page.
    if (!syncedTrackId && registrationId) {
      const payment = await prisma.payment.findFirst({
        where: { registrationId },
        select: { trackId: true },
      })
      syncedTrackId = payment?.trackId ?? null
    }

    const returnUrl = new URL(`${getAppUrl()}/return`)
    if (syncedTrackId) returnUrl.searchParams.set('trackId', syncedTrackId)
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
