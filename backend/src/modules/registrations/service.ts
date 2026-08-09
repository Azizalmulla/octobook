import type { Payment, Registration, Session } from "@prisma/client";
import { PaymentGateway, RegistrationStatus } from "@prisma/client";
import type { Env } from "../../config/env.js";
import { AiCollectionClient, type AiCollectionGatewayId } from "../../lib/ai-collection.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { WhatsappTemplateClient } from "../../lib/whatsapp.js";
import type { CreateRegistrationInput } from "./schema.js";

type RegistrationWithRelations = Registration & {
  session: Session;
  payment: Payment | null;
};

function gatewayToProviderId(gateway: "KNET" | "CARD"): AiCollectionGatewayId {
  return gateway === "CARD" ? 2 : 1;
}

function formatSessionLabel(session: Session, locale: string): string {
  const dateLocale = locale === "ar" ? "ar-KW" : "en-GB";
  const date = new Intl.DateTimeFormat(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: session.timezone || "Asia/Kuwait",
  }).format(session.startsAt);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: session.timezone || "Asia/Kuwait",
  }).format(session.startsAt);
  return `${date}, ${time} (GMT+3)`;
}

function formatSessionLabels(session: Session) {
  return {
    labelEn: formatSessionLabel(session, "en"),
    labelAr: formatSessionLabel(session, "ar"),
  };
}

function toFrontendPaymentStatus(
  status: RegistrationStatus,
): "PENDING_PAYMENT" | "PAID" | "FAILED" | "EXPIRED" {
  if (status === RegistrationStatus.PAID) return "PAID";
  if (status === RegistrationStatus.EXPIRED) return "EXPIRED";
  if (status === RegistrationStatus.PENDING_PAYMENT) return "PENDING_PAYMENT";
  return "FAILED";
}

function toCreatedRegistration(registration: RegistrationWithRelations, paymentLink: string, trackId: string) {
  return {
    registrationId: registration.id,
    reference: registration.id,
    trackId,
    paymentLink,
    status: toFrontendPaymentStatus(registration.status),
  };
}

function toPaymentSync(registration: RegistrationWithRelations) {
  return {
    trackId: registration.payment?.trackId ?? "",
    reference: registration.id,
    status: toFrontendPaymentStatus(registration.status),
    paidAt: registration.payment?.paidAt?.toISOString() ?? null,
    amount: registration.amountKwd.toFixed(3),
    currency: "KWD",
    session: formatSessionLabels(registration.session),
  };
}

function serializeRegistration(registration: RegistrationWithRelations) {
  return {
    id: registration.id,
    fullName: registration.fullName,
    whatsappNumber: registration.whatsappNumber,
    email: registration.email,
    companyName: registration.companyName,
    country: registration.country,
    businessType: registration.businessType,
    hasB2bClients: registration.hasB2bClients,
    buildGoal: registration.buildGoal,
    locale: registration.locale,
    status: registration.status,
    amountKwd: registration.amountKwd.toFixed(3),
    whatsappSentAt: registration.whatsappSentAt?.toISOString() ?? null,
    whatsappError: registration.whatsappError,
    session: {
      id: registration.session.id,
      slug: registration.session.slug,
      startsAt: registration.session.startsAt.toISOString(),
      endsAt: registration.session.endsAt.toISOString(),
      timezone: registration.session.timezone,
    },
    payment: registration.payment
      ? {
          id: registration.payment.id,
          trackId: registration.payment.trackId,
          paymentLink: registration.payment.paymentLink,
          gateway: registration.payment.gateway,
          providerStatus: registration.payment.providerStatus,
          paidAt: registration.payment.paidAt?.toISOString() ?? null,
        }
      : null,
    createdAt: registration.createdAt.toISOString(),
  };
}

export class RegistrationService {
  private readonly payments: AiCollectionClient;
  private readonly whatsapp: WhatsappTemplateClient;

  constructor(private readonly env: Env) {
    this.payments = new AiCollectionClient(env);
    this.whatsapp = new WhatsappTemplateClient(env);
  }

  private async sendWhatsappConfirmation(registration: RegistrationWithRelations) {
    if (registration.whatsappSentAt) {
      return registration;
    }

    try {
      await this.whatsapp.sendRegistrationConfirmed({
        to: registration.whatsappNumber,
        name: registration.fullName,
        sessionLabel: formatSessionLabel(registration.session, registration.locale),
        amountKwd: Number(registration.amountKwd).toFixed(0),
      });

      return prisma.registration.update({
        where: { id: registration.id },
        data: {
          whatsappSentAt: new Date(),
          whatsappError: null,
        },
        include: { session: true, payment: true },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "WhatsApp send failed";
      return prisma.registration.update({
        where: { id: registration.id },
        data: { whatsappError: message.slice(0, 500) },
        include: { session: true, payment: true },
      });
    }
  }

  async create(input: CreateRegistrationInput) {
    const session = await prisma.session.findFirst({
      where: { id: input.sessionId, isActive: true },
    });

    if (!session) {
      throw new AppError(404, "Session not found or inactive", "SESSION_NOT_FOUND");
    }

    const existingPaid = await prisma.registration.findFirst({
      where: {
        email: input.email.toLowerCase(),
        sessionId: session.id,
        status: RegistrationStatus.PAID,
      },
    });

    if (existingPaid) {
      throw new AppError(
        409,
        "This email is already registered and paid for this session",
        "ALREADY_REGISTERED",
      );
    }

    const amount = this.env.REGISTRATION_FEE_KWD;
    const gateway = input.paymentGateway === "CARD" ? PaymentGateway.CARD : PaymentGateway.KNET;

    const registration = await prisma.registration.create({
      data: {
        fullName: input.fullName,
        whatsappNumber: input.whatsappNumber,
        email: input.email.toLowerCase(),
        companyName: input.companyName,
        country: input.country,
        businessType: input.businessType,
        hasB2bClients: input.hasB2bClients,
        buildGoal: input.buildGoal,
        locale: input.locale,
        amountKwd: amount,
        sessionId: session.id,
        status: RegistrationStatus.PENDING_PAYMENT,
        payment: {
          create: {
            amountKwd: amount,
            gateway,
          },
        },
      },
      include: {
        session: true,
        payment: true,
      },
    });

    try {
      const payment = await this.payments.createPayment({
        amount,
        customerPhone: input.whatsappNumber,
        customerName: input.fullName,
        customerEmail: input.email,
        language: input.locale,
        paymentGatewaysId: gatewayToProviderId(input.paymentGateway),
      });

      const updated = await prisma.registration.update({
        where: { id: registration.id },
        data: {
          payment: {
            update: {
              trackId: payment.trackId,
              paymentLink: payment.paymentLink,
              providerStatus: "created",
              providerPayload: payment.raw as object,
            },
          },
        },
        include: {
          session: true,
          payment: true,
        },
      });

      return toCreatedRegistration(updated, payment.paymentLink, payment.trackId);
    } catch (error) {
      await prisma.registration.update({
        where: { id: registration.id },
        data: { status: RegistrationStatus.FAILED },
      });
      throw error;
    }
  }

  async getById(id: string) {
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { session: true, payment: true },
    });

    if (!registration) {
      throw new AppError(404, "Registration not found", "REGISTRATION_NOT_FOUND");
    }

    return serializeRegistration(registration);
  }

  async syncPaymentByTrackId(trackId: string) {
    const payment = await prisma.payment.findUnique({
      where: { trackId },
      include: {
        registration: {
          include: { session: true, payment: true },
        },
      },
    });

    if (!payment) {
      throw new AppError(404, "Payment not found", "PAYMENT_NOT_FOUND");
    }

    if (payment.registration.status === RegistrationStatus.PAID) {
      const withWhatsapp = await this.sendWhatsappConfirmation({
        ...payment.registration,
        payment,
      });
      return toPaymentSync(withWhatsapp);
    }

    const status = await this.payments.getPaymentStatus(trackId);

    const nextStatus = status.isPaid
      ? RegistrationStatus.PAID
      : status.status && ["failed", "fail", "declined"].includes(status.status.toLowerCase())
        ? RegistrationStatus.FAILED
        : status.status && ["cancelled", "canceled"].includes(status.status.toLowerCase())
          ? RegistrationStatus.CANCELLED
          : status.status && status.status.toLowerCase() === "expired"
            ? RegistrationStatus.EXPIRED
            : RegistrationStatus.PENDING_PAYMENT;

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerStatus: status.status ?? (status.isPaid ? "paid" : "pending"),
        providerPayload: status.raw as object,
        lastCheckedAt: new Date(),
        paidAt: status.isPaid ? new Date() : payment.paidAt,
        registration: {
          update: {
            status: nextStatus,
          },
        },
      },
      include: {
        registration: {
          include: { session: true, payment: true },
        },
      },
    });

    let registration: RegistrationWithRelations = {
      ...updatedPayment.registration,
      payment: updatedPayment,
    };

    if (nextStatus === RegistrationStatus.PAID) {
      registration = await this.sendWhatsappConfirmation(registration);
    }

    return toPaymentSync(registration);
  }

  async syncPaymentByRegistrationId(registrationId: string) {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true, session: true },
    });

    if (!registration) {
      throw new AppError(404, "Registration not found", "REGISTRATION_NOT_FOUND");
    }

    if (!registration.payment?.trackId) {
      throw new AppError(409, "Registration has no payment track id yet", "PAYMENT_TRACK_MISSING");
    }

    return this.syncPaymentByTrackId(registration.payment.trackId);
  }
}
