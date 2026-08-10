import { handlePaymentCallback } from '@/lib/server/payment-callback'

export const runtime = 'nodejs'

type Params = { params: Promise<{ registrationId: string }> }

export async function GET(request: Request, { params }: Params) {
  const { registrationId } = await params
  return handlePaymentCallback(request, registrationId)
}

export async function POST(request: Request, { params }: Params) {
  const { registrationId } = await params
  return handlePaymentCallback(request, registrationId)
}
