-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('TECHNOLOGY_SOFTWARE', 'DIGITAL_AGENCY', 'AI_AUTOMATION', 'MARKETING_AGENCY', 'STARTUP', 'OTHER');

-- CreateEnum
CREATE TYPE "BuildGoal" AS ENUM ('OWN_AI_AUTOMATION_PLATFORM', 'ADD_WHATSAPP_API', 'OFFER_AI_SOLUTIONS', 'LAUNCH_SAAS_PRODUCT', 'EXPLORE_BUSINESS_OPPORTUNITY', 'STILL_EXPLORING');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('KNET', 'CARD');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kuwait',
    "capacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "hasB2bClients" BOOLEAN NOT NULL,
    "buildGoal" "BuildGoal" NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amountKwd" DECIMAL(10,3) NOT NULL DEFAULT 40.000,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'ai_collection',
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'KNET',
    "amountKwd" DECIMAL(10,3) NOT NULL,
    "trackId" TEXT,
    "paymentLink" TEXT,
    "providerStatus" TEXT,
    "providerPayload" JSONB,
    "paidAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_slug_key" ON "Session"("slug");

-- CreateIndex
CREATE INDEX "Registration_email_idx" ON "Registration"("email");

-- CreateIndex
CREATE INDEX "Registration_status_idx" ON "Registration"("status");

-- CreateIndex
CREATE INDEX "Registration_sessionId_idx" ON "Registration"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_registrationId_key" ON "Payment"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_trackId_key" ON "Payment"("trackId");

-- CreateIndex
CREATE INDEX "Payment_trackId_idx" ON "Payment"("trackId");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
