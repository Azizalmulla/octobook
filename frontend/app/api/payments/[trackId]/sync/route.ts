import { getServerEnv } from '@/lib/server/env'
import { jsonError, jsonOk } from '@/lib/server/http'
import { RegistrationService } from '@/lib/server/registration-service'

export const runtime = 'nodejs'

type Params = { params: Promise<{ trackId: string }> }

export async function POST(_request: Request, { params }: Params) {
  try {
    const { trackId } = await params
    const service = new RegistrationService(getServerEnv())
    const result = await service.syncPaymentByTrackId(trackId)
    return jsonOk(result)
  } catch (error) {
    return jsonError(error)
  }
}
