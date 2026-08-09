import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:3001"),
  DATABASE_URL: z.string().min(1),
  REGISTRATION_FEE_KWD: z.string().default("40.000"),
  AI_COLLECTION_BASE_URL: z
    .string()
    .url()
    .default("https://ai-collection.com/businessapi"),
  AI_COLLECTION_BEARER_TOKEN: z.string().optional().default(""),
  AI_COLLECTION_DEFAULT_GATEWAY_ID: z.coerce.number().int().min(1).max(2).default(1),
  WHATSAPP_TEMPLATE_URL: z
    .string()
    .url()
    .default("https://app.ai-octopus.com/template/sent"),
  WHATSAPP_TEMPLATE_TOKEN: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
