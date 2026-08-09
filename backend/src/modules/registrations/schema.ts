import { z } from "zod";

export const businessTypeSchema = z.enum([
  "TECHNOLOGY_SOFTWARE",
  "DIGITAL_AGENCY",
  "AI_AUTOMATION",
  "MARKETING_AGENCY",
  "STARTUP",
  "OTHER",
]);

export const buildGoalSchema = z.enum([
  "OWN_AI_AUTOMATION_PLATFORM",
  "ADD_WHATSAPP_API",
  "OFFER_AI_SOLUTIONS",
  "LAUNCH_SAAS_PRODUCT",
  "EXPLORE_BUSINESS_OPPORTUNITY",
  "STILL_EXPLORING",
]);

export const createRegistrationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  whatsappNumber: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(180),
  companyName: z.string().trim().min(1).max(180),
  country: z.string().trim().min(2).max(120),
  businessType: businessTypeSchema,
  hasB2bClients: z.boolean(),
  buildGoal: buildGoalSchema,
  sessionId: z.string().trim().min(1),
  locale: z.enum(["en", "ar"]).default("en"),
  paymentGateway: z.enum(["KNET", "CARD"]).default("KNET"),
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
