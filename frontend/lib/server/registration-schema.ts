import { z } from 'zod'

export const businessTypeSchema = z.enum([
  'TECHNOLOGY_SOFTWARE',
  'DIGITAL_AGENCY',
  'AI_AUTOMATION',
  'MARKETING_AGENCY',
  'STARTUP',
  'OTHER',
])

const buildGoalAliases: Record<string, string> = {
  OWN_AI_AUTOMATION_PLATFORM: 'OWN_AI_AUTOMATION_PLATFORM',
  OWN_PLATFORM: 'OWN_AI_AUTOMATION_PLATFORM',
  ADD_WHATSAPP_API: 'ADD_WHATSAPP_API',
  WHATSAPP_API: 'ADD_WHATSAPP_API',
  OFFER_AI_SOLUTIONS: 'OFFER_AI_SOLUTIONS',
  CLIENT_SOLUTIONS: 'OFFER_AI_SOLUTIONS',
  LAUNCH_SAAS_PRODUCT: 'LAUNCH_SAAS_PRODUCT',
  NEW_SAAS: 'LAUNCH_SAAS_PRODUCT',
  EXPLORE_BUSINESS_OPPORTUNITY: 'EXPLORE_BUSINESS_OPPORTUNITY',
  NEW_OPPORTUNITY: 'EXPLORE_BUSINESS_OPPORTUNITY',
  STILL_EXPLORING: 'STILL_EXPLORING',
}

export const buildGoalSchema = z
  .string()
  .transform((value) => buildGoalAliases[value] ?? value)
  .pipe(
    z.enum([
      'OWN_AI_AUTOMATION_PLATFORM',
      'ADD_WHATSAPP_API',
      'OFFER_AI_SOLUTIONS',
      'LAUNCH_SAAS_PRODUCT',
      'EXPLORE_BUSINESS_OPPORTUNITY',
      'STILL_EXPLORING',
    ]),
  )

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, '')
}

export const createRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    whatsappCountryCode: z.string().trim().optional(),
    whatsappNumber: z.string().trim().min(6).max(20),
    email: z.string().trim().email().max(180),
    companyName: z.string().trim().min(1).max(180),
    country: z.string().trim().min(2).max(120),
    businessType: businessTypeSchema,
    hasB2bClients: z.boolean(),
    buildGoal: buildGoalSchema,
    sessionId: z.string().trim().min(1),
    locale: z.enum(['en', 'ar']).optional(),
    language: z.enum(['en', 'ar']).optional(),
    paymentGateway: z.enum(['KNET', 'CARD']).default('KNET'),
    idempotencyKey: z.string().trim().min(8).max(120).optional(),
  })
  .transform((input) => {
    const national = digitsOnly(input.whatsappNumber).replace(/^0+/, '')
    const countryCode = digitsOnly(input.whatsappCountryCode ?? '')
    const combined =
      countryCode && !national.startsWith(countryCode)
        ? `${countryCode}${national}`
        : national || digitsOnly(input.whatsappNumber)

    return {
      fullName: input.fullName,
      whatsappNumber: combined,
      email: input.email,
      companyName: input.companyName,
      country: input.country,
      businessType: input.businessType,
      hasB2bClients: input.hasB2bClients,
      buildGoal: input.buildGoal,
      sessionId: input.sessionId,
      locale: input.locale ?? input.language ?? 'en',
      paymentGateway: input.paymentGateway,
      idempotencyKey: input.idempotencyKey,
    }
  })

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>

export const businessTypeLabels = {
  TECHNOLOGY_SOFTWARE: { en: 'Technology / Software', ar: 'تكنولوجيا / برمجيات' },
  DIGITAL_AGENCY: { en: 'Digital Agency', ar: 'وكالة رقمية' },
  AI_AUTOMATION: { en: 'AI & Automation', ar: 'الذكاء الاصطناعي والأتمتة' },
  MARKETING_AGENCY: { en: 'Marketing Agency', ar: 'وكالة تسويق' },
  STARTUP: { en: 'Startup', ar: 'شركة ناشئة' },
  OTHER: { en: 'Other', ar: 'أخرى' },
} as const

export const buildGoalLabels = {
  OWN_AI_AUTOMATION_PLATFORM: {
    en: 'Build our own AI & Automation platform',
    ar: 'بناء منصة الذكاء الاصطناعي والأتمتة الخاصة بنا',
  },
  ADD_WHATSAPP_API: {
    en: 'Add WhatsApp API to our services',
    ar: 'إضافة واتساب API إلى خدماتنا',
  },
  OFFER_AI_SOLUTIONS: {
    en: 'Offer AI solutions to our clients',
    ar: 'تقديم حلول الذكاء الاصطناعي لعملائنا',
  },
  LAUNCH_SAAS_PRODUCT: {
    en: 'Launch a new SaaS product',
    ar: 'إطلاق منتج SaaS جديد',
  },
  EXPLORE_BUSINESS_OPPORTUNITY: {
    en: 'Explore a new business opportunity',
    ar: 'استكشاف فرصة عمل جديدة',
  },
  STILL_EXPLORING: {
    en: 'Still exploring',
    ar: 'ما زلت أستكشف',
  },
} as const

export const COUNTRIES = [
  { code: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت', dialCode: '965' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية', dialCode: '966' },
  { code: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات', dialCode: '971' },
  { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر', dialCode: '974' },
  { code: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين', dialCode: '973' },
  { code: 'OM', nameEn: 'Oman', nameAr: 'عمان', dialCode: '968' },
  { code: 'IQ', nameEn: 'Iraq', nameAr: 'العراق', dialCode: '964' },
  { code: 'JO', nameEn: 'Jordan', nameAr: 'الأردن', dialCode: '962' },
  { code: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان', dialCode: '961' },
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', dialCode: '20' },
  { code: 'MA', nameEn: 'Morocco', nameAr: 'المغرب', dialCode: '212' },
  { code: 'TN', nameEn: 'Tunisia', nameAr: 'تونس', dialCode: '216' },
  { code: 'DZ', nameEn: 'Algeria', nameAr: 'الجزائر', dialCode: '213' },
  { code: 'TR', nameEn: 'Turkey', nameAr: 'تركيا', dialCode: '90' },
  { code: 'GB', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', dialCode: '44' },
  { code: 'US', nameEn: 'United States', nameAr: 'الولايات المتحدة', dialCode: '1' },
  { code: 'CA', nameEn: 'Canada', nameAr: 'كندا', dialCode: '1' },
  { code: 'DE', nameEn: 'Germany', nameAr: 'ألمانيا', dialCode: '49' },
  { code: 'FR', nameEn: 'France', nameAr: 'فرنسا', dialCode: '33' },
  { code: 'IN', nameEn: 'India', nameAr: 'الهند', dialCode: '91' },
  { code: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان', dialCode: '92' },
] as const
