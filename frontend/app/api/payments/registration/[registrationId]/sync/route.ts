import { jsonError, jsonOk } from '@/lib/server/http'
import { getServerEnv } from '@/lib/server/env'
import { RegistrationService } from '@/lib/server/registration-service'

export const runtime = 'nodejs'

type Params = { params: Promise<{ registrationId: string }> }

export async function POST(_request: Request, { params }: Params) {
  try {
    const { registrationId } = await params
    const service = new RegistrationService(getServerEnv())
    const result = await service.syncPaymentByRegistrationId(registrationId)
    return jsonOk(result)
  } catch (error) {
    return jsonError(error)
  }
}
