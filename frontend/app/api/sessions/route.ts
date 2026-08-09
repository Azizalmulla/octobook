import { formatSessionItem, listSessionsPayload } from '@/lib/server/registration-service'
import { jsonError, jsonOk } from '@/lib/server/http'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const sessions = await listSessionsPayload()
    return jsonOk({
      sessions: sessions.map(formatSessionItem),
    })
  } catch (error) {
    return jsonError(error)
  }
}
