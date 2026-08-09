import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REGISTRATION_FEE_KWD: z.string().default('1.000'),
  APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  AI_COLLECTION_BASE_URL: z
    .string()
    .url()
    .default('https://ai-collection.com/businessapi'),
  AI_COLLECTION_BEARER_TOKEN: z.string().optional().default(''),
  AI_COLLECTION_DEFAULT_GATEWAY_ID: z.coerce.number().int().min(1).max(2).default(1),
  WHATSAPP_TEMPLATE_URL: z
    .string()
    .url()
    .default('https://app.ai-octopus.com/template/sent'),
  WHATSAPP_TEMPLATE_TOKEN: z.string().optional().default(''),
})

export type ServerEnv = z.infer<typeof envSchema>

let cached: ServerEnv | null = null

export function getServerEnv(): ServerEnv {
  if (cached) return cached
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Invalid server env', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid server environment variables')
  }
  cached = parsed.data
  return cached
}

export function getAppUrl(env: ServerEnv = getServerEnv()): string {
  return (env.APP_URL || env.NEXT_PUBLIC_SITE_URL || 'https://octobook-pearl.vercel.app').replace(
    /\/$/,
    '',
  )
}
