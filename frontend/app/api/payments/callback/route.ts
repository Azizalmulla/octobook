import { handlePaymentCallback } from '@/lib/server/payment-callback'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  return handlePaymentCallback(request)
}

export async function POST(request: Request) {
  return handlePaymentCallback(request)
}
