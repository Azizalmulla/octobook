import { getServerEnv } from '@/lib/server/env'
import { jsonError, jsonOk } from '@/lib/server/http'
import { createRegistrationSchema } from '@/lib/server/registration-schema'
import { RegistrationService } from '@/lib/server/registration-service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = createRegistrationSchema.parse(await request.json())
    const service = new RegistrationService(getServerEnv())
    const created = await service.create(body)
    return jsonOk(created, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
