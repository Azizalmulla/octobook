import { getServerEnv } from '@/lib/server/env'
import { jsonError, jsonOk } from '@/lib/server/http'
import {
  COUNTRIES,
  businessTypeLabels,
  buildGoalLabels,
} from '@/lib/server/registration-schema'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const env = getServerEnv()
    const amount = Number(env.REGISTRATION_FEE_KWD).toFixed(3)
    return jsonOk({
      fee: {
        amount,
        currency: 'KWD',
        labelEn: `KWD ${Number(amount).toFixed(0)}`,
        labelAr: `${Number(amount).toFixed(0)} دينار كويتي`,
      },
      countries: COUNTRIES,
      businessTypes: Object.entries(businessTypeLabels).map(([code, labels]) => ({
        code,
        labelEn: labels.en,
        labelAr: labels.ar,
      })),
      buildGoals: Object.entries(buildGoalLabels).map(([code, labels]) => ({
        code,
        labelEn: labels.en,
        labelAr: labels.ar,
      })),
    })
  } catch (error) {
    return jsonError(error)
  }
}
