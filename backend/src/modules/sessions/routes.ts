import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { businessTypeLabels, buildGoalLabels } from "../registrations/schema.js";

function formatSessionLabel(startsAt: Date, locale: "en" | "ar") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kuwait",
  }).format(startsAt);
}

function formatSessionTime(startsAt: Date, endsAt: Date) {
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kuwait",
  });
  return `${time.format(startsAt)} - ${time.format(endsAt)} (GMT+3)`;
}

export const sessionRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (_request, reply) => {
    const sessions = await prisma.session.findMany({
      where: { isActive: true },
      orderBy: { startsAt: "asc" },
    });

    return reply.send({
      success: true,
      data: sessions.map((session) => ({
        id: session.id,
        slug: session.slug,
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
        timezone: session.timezone,
        label: {
          en: formatSessionLabel(session.startsAt, "en"),
          ar: formatSessionLabel(session.startsAt, "ar"),
        },
        timeLabel: {
          en: formatSessionTime(session.startsAt, session.endsAt),
          ar: formatSessionTime(session.startsAt, session.endsAt),
        },
      })),
    });
  });
};

export const metaRoutes: FastifyPluginAsync<{ feeKwd: string }> = async (app, opts) => {
  app.get("/registration-options", async (_request, reply) => {
    return reply.send({
      success: true,
      data: {
        feeKwd: Number(opts.feeKwd).toFixed(3),
        currency: "KWD",
        businessTypes: Object.entries(businessTypeLabels).map(([value, labels]) => ({
          value,
          labels,
        })),
        buildGoals: Object.entries(buildGoalLabels).map(([value, labels]) => ({
          value,
          labels,
        })),
        locales: ["en", "ar"],
        paymentGateways: [
          { value: "KNET", providerId: 1, labels: { en: "KNET", ar: "كي نت" } },
          {
            value: "CARD",
            providerId: 2,
            labels: { en: "Visa / Mastercard", ar: "فيزا / ماستركارد" },
          },
        ],
      },
    });
  });
};
