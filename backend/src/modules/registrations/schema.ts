import { z } from "zod";

export const businessTypeSchema = z.enum([
  "TECHNOLOGY_SOFTWARE",
  "DIGITAL_AGENCY",
  "AI_AUTOMATION",
  "MARKETING_AGENCY",
  "STARTUP",
  "OTHER",
]);

const buildGoalAliases: Record<string, string> = {
  OWN_AI_AUTOMATION_PLATFORM: "OWN_AI_AUTOMATION_PLATFORM",
  OWN_PLATFORM: "OWN_AI_AUTOMATION_PLATFORM",
  ADD_WHATSAPP_API: "ADD_WHATSAPP_API",
  WHATSAPP_API: "ADD_WHATSAPP_API",
  OFFER_AI_SOLUTIONS: "OFFER_AI_SOLUTIONS",
  CLIENT_SOLUTIONS: "OFFER_AI_SOLUTIONS",
  LAUNCH_SAAS_PRODUCT: "LAUNCH_SAAS_PRODUCT",
  NEW_SAAS: "LAUNCH_SAAS_PRODUCT",
  EXPLORE_BUSINESS_OPPORTUNITY: "EXPLORE_BUSINESS_OPPORTUNITY",
  NEW_OPPORTUNITY: "EXPLORE_BUSINESS_OPPORTUNITY",
  STILL_EXPLORING: "STILL_EXPLORING",
};

export const buildGoalSchema = z
  .string()
  .transform((value) => buildGoalAliases[value] ?? value)
  .pipe(
    z.enum([
      "OWN_AI_AUTOMATION_PLATFORM",
      "ADD_WHATSAPP_API",
      "OFFER_AI_SOLUTIONS",
      "LAUNCH_SAAS_PRODUCT",
      "EXPLORE_BUSINESS_OPPORTUNITY",
      "STILL_EXPLORING",
    ]),
  );

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export const createRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    // Frontend sends country code + national number separately.
    whatsappCountryCode: z.string().trim().optional(),
    whatsappNumber: z.string().trim().min(6).max(20),
    email: z.string().trim().email().max(180),
    companyName: z.string().trim().min(1).max(180),
    country: z.string().trim().min(2).max(120),
    businessType: businessTypeSchema,
    hasB2bClients: z.boolean(),
    buildGoal: buildGoalSchema,
    sessionId: z.string().trim().min(1),
    locale: z.enum(["en", "ar"]).optional(),
    language: z.enum(["en", "ar"]).optional(),
    paymentGateway: z.enum(["KNET", "CARD"]).default("KNET"),
    idempotencyKey: z.string().trim().min(8).max(120).optional(),
  })
  .transform((input) => {
    const national = digitsOnly(input.whatsappNumber).replace(/^0+/, "");
    const countryCode = digitsOnly(input.whatsappCountryCode ?? "");
    const combined =
      countryCode && !national.startsWith(countryCode) ? `${countryCode}${national}` : national || digitsOnly(input.whatsappNumber);

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
      locale: input.locale ?? input.language ?? "en",
      paymentGateway: input.paymentGateway,
      idempotencyKey: input.idempotencyKey,
    };
  });

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;

export const businessTypeLabels = {
  TECHNOLOGY_SOFTWARE: { en: "Technology / Software", ar: "تكنولوجيا / برمجيات" },
  DIGITAL_AGENCY: { en: "Digital Agency", ar: "وكالة رقمية" },
  AI_AUTOMATION: { en: "AI & Automation", ar: "الذكاء الاصطناعي والأتمتة" },
  MARKETING_AGENCY: { en: "Marketing Agency", ar: "وكالة تسويق" },
  STARTUP: { en: "Startup", ar: "شركة ناشئة" },
  OTHER: { en: "Other", ar: "أخرى" },
} as const;

export const buildGoalLabels = {
  OWN_AI_AUTOMATION_PLATFORM: {
    en: "Build our own AI & Automation platform",
    ar: "بناء منصة الذكاء الاصطناعي والأتمتة الخاصة بنا",
  },
  ADD_WHATSAPP_API: {
    en: "Add WhatsApp API to our services",
    ar: "إضافة واتساب API إلى خدماتنا",
  },
  OFFER_AI_SOLUTIONS: {
    en: "Offer AI solutions to our clients",
    ar: "تقديم حلول الذكاء الاصطناعي لعملائنا",
  },
  LAUNCH_SAAS_PRODUCT: {
    en: "Launch a new SaaS product",
    ar: "إطلاق منتج SaaS جديد",
  },
  EXPLORE_BUSINESS_OPPORTUNITY: {
    en: "Explore a new business opportunity",
    ar: "استكشاف فرصة عمل جديدة",
  },
  STILL_EXPLORING: {
    en: "Still exploring",
    ar: "ما زلت أستكشف",
  },
} as const;
