import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { businessTypeLabels, buildGoalLabels } from "../registrations/schema.js";

const COUNTRIES = [
  { code: "KW", nameEn: "Kuwait", nameAr: "الكويت", dialCode: "965" },
  { code: "SA", nameEn: "Saudi Arabia", nameAr: "السعودية", dialCode: "966" },
  { code: "AE", nameEn: "United Arab Emirates", nameAr: "الإمارات", dialCode: "971" },
  { code: "QA", nameEn: "Qatar", nameAr: "قطر", dialCode: "974" },
  { code: "BH", nameEn: "Bahrain", nameAr: "البحرين", dialCode: "973" },
  { code: "OM", nameEn: "Oman", nameAr: "عمان", dialCode: "968" },
  { code: "IQ", nameEn: "Iraq", nameAr: "العراق", dialCode: "964" },
  { code: "JO", nameEn: "Jordan", nameAr: "الأردن", dialCode: "962" },
  { code: "LB", nameEn: "Lebanon", nameAr: "لبنان", dialCode: "961" },
  { code: "EG", nameEn: "Egypt", nameAr: "مصر", dialCode: "20" },
  { code: "MA", nameEn: "Morocco", nameAr: "المغرب", dialCode: "212" },
  { code: "TN", nameEn: "Tunisia", nameAr: "تونس", dialCode: "216" },
  { code: "DZ", nameEn: "Algeria", nameAr: "الجزائر", dialCode: "213" },
  { code: "TR", nameEn: "Turkey", nameAr: "تركيا", dialCode: "90" },
  { code: "GB", nameEn: "United Kingdom", nameAr: "المملكة المتحدة", dialCode: "44" },
  { code: "US", nameEn: "United States", nameAr: "الولايات المتحدة", dialCode: "1" },
  { code: "CA", nameEn: "Canada", nameAr: "كندا", dialCode: "1" },
  { code: "DE", nameEn: "Germany", nameAr: "ألمانيا", dialCode: "49" },
  { code: "FR", nameEn: "France", nameAr: "فرنسا", dialCode: "33" },
  { code: "IN", nameEn: "India", nameAr: "الهند", dialCode: "91" },
  { code: "PK", nameEn: "Pakistan", nameAr: "باكستان", dialCode: "92" },
] as const;

function formatSessionLabel(startsAt: Date, locale: "en" | "ar") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kuwait",
  }).format(startsAt);
}

export const sessionRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (_request, reply) => {
    const sessions = await prisma.session.findMany({
      where: { isActive: true },
      orderBy: { startsAt: "asc" },
    });

    // Shape matches frontend SessionItem contract.
    return reply.send({
      sessions: sessions.map((session) => {
        const seatsRemaining = session.capacity ?? 100;
        return {
          id: session.id,
          code: session.slug.toUpperCase().replace(/-/g, "_"),
          startsAt: session.startsAt.toISOString(),
          endsAt: session.endsAt.toISOString(),
          timezone: session.timezone,
          labelEn: formatSessionLabel(session.startsAt, "en"),
          labelAr: formatSessionLabel(session.startsAt, "ar"),
          seatsRemaining,
          isSelectable: session.isActive && seatsRemaining > 0,
        };
      }),
    });
  });
};

export const metaRoutes: FastifyPluginAsync<{ feeKwd: string }> = async (app, opts) => {
  app.get("/registration-options", async (_request, reply) => {
    const amount = Number(opts.feeKwd).toFixed(3);
    return reply.send({
      fee: {
        amount,
        currency: "KWD",
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
    });
  });
};
