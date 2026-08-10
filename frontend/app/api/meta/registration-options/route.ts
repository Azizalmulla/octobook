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
    const numeric = Number(amount)
    const labelEn =
      numeric > 0 && numeric < 1
        ? `${Math.round(numeric * 1000)} fils`
        : `KWD ${Number.isInteger(numeric) ? numeric.toFixed(0) : amount}`
    const labelAr =
      numeric > 0 && numeric < 1
        ? `${Math.round(numeric * 1000)} فلس`
        : `${Number.isInteger(numeric) ? numeric.toFixed(0) : amount} دينار كويتي`
    return jsonOk({
      fee: {
        amount,
        currency: 'KWD',
        labelEn,
        labelAr,
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
