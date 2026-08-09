-- implements [S12] PostgreSQL schema for Neon
-- Run this file on the database. Prisma models must match field for field.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE registration_status AS ENUM (
  'DRAFT',
  'PENDING_PAYMENT',
  'PAID',
  'FAILED',
  'EXPIRED',
  'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
  'CREATED',
  'PENDING',
  'PAID',
  'FAILED',
  'EXPIRED'
);

CREATE TYPE lang_code AS ENUM ('en', 'ar');

CREATE TABLE sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL UNIQUE,
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  timezone      text NOT NULL DEFAULT 'Asia/Kuwait',
  label_en      text NOT NULL,
  label_ar      text NOT NULL,
  capacity      integer NOT NULL DEFAULT 100,
  seats_taken   integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sessions_time_order CHECK (ends_at > starts_at),
  CONSTRAINT sessions_seats_range CHECK (seats_taken >= 0 AND seats_taken <= capacity)
);

CREATE TABLE option_values (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key  text NOT NULL,
  code       text NOT NULL,
  label_en   text NOT NULL,
  label_ar   text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true,
  UNIQUE (group_key, code)
);

CREATE SEQUENCE registration_reference_seq START 100001;

CREATE TABLE registrations (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference              text NOT NULL UNIQUE
                         DEFAULT ('OCT' || nextval('registration_reference_seq')::text),
  session_id             uuid NOT NULL REFERENCES sessions(id) ON DELETE RESTRICT,
  full_name              text NOT NULL,
  whatsapp_country_code  text NOT NULL,
  whatsapp_number        text NOT NULL,
  whatsapp_e164          text NOT NULL,
  email                  text NOT NULL,
  company_name           text NOT NULL,
  country_code           char(2) NOT NULL,
  business_type          text NOT NULL,
  has_b2b_clients        boolean NOT NULL,
  build_goal             text NOT NULL,
  language               lang_code NOT NULL DEFAULT 'en',
  amount                 numeric(12,3) NOT NULL DEFAULT 40.000,
  currency               char(3) NOT NULL DEFAULT 'KWD',
  status                 registration_status NOT NULL DEFAULT 'DRAFT',
  idempotency_key        text,
  source_ip              inet,
  user_agent             text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  paid_at                timestamptz,
  CONSTRAINT registrations_email_shape CHECK (position('@' in email) > 1),
  CONSTRAINT registrations_phone_digits CHECK (whatsapp_e164 ~ '^[0-9]{8,15}$'),
  CONSTRAINT registrations_amount_positive CHECK (amount > 0)
);

CREATE UNIQUE INDEX registrations_unique_paid_seat
  ON registrations (lower(email), session_id)
  WHERE status = 'PAID';

CREATE UNIQUE INDEX registrations_idempotency
  ON registrations (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX registrations_status_idx  ON registrations (status);
CREATE INDEX registrations_session_idx ON registrations (session_id);
CREATE INDEX registrations_created_idx ON registrations (created_at DESC);

CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id     uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  track_id            text NOT NULL UNIQUE,
  payment_link        text,
  gateway_id          integer,
  gateway_name        text,
  amount              numeric(12,3) NOT NULL,
  currency            char(3) NOT NULL DEFAULT 'KWD',
  status              payment_status NOT NULL DEFAULT 'CREATED',
  create_request      jsonb,
  create_response     jsonb,
  last_status_response jsonb,
  paid_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payments_registration_idx ON payments (registration_id);
CREATE INDEX payments_status_idx       ON payments (status);

CREATE TABLE payment_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id  uuid REFERENCES payments(id) ON DELETE CASCADE,
  track_id    text,
  event_type  text NOT NULL,
  payload     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payment_events_track_idx ON payment_events (track_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_touch      BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER registrations_touch BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payments_touch      BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO sessions (code, starts_at, ends_at, label_en, label_ar, capacity)
VALUES
 ('SESSION_THU_2026_09_03','2026-09-03 16:00:00+00','2026-09-03 18:00:00+00',
  'Thursday 3 September 2026','الخميس 3 سبتمبر 2026',100),
 ('SESSION_SUN_2026_09_06','2026-09-06 16:00:00+00','2026-09-06 18:00:00+00',
  'Sunday 6 September 2026','الأحد 6 سبتمبر 2026',100);

INSERT INTO option_values (group_key, code, label_en, label_ar, sort_order) VALUES
 ('business_type','TECHNOLOGY_SOFTWARE','Technology and Software','تقنية وبرمجيات',1),
 ('business_type','DIGITAL_AGENCY','Digital Agency','وكالة رقمية',2),
 ('business_type','AI_AUTOMATION','AI and Automation','ذكاء اصطناعي وأتمتة',3),
 ('business_type','MARKETING_AGENCY','Marketing Agency','وكالة تسويق',4),
 ('business_type','STARTUP','Startup','شركة ناشئة',5),
 ('business_type','OTHER','Other','أخرى',6),
 ('build_goal','OWN_PLATFORM','Build our own AI and Automation platform','بناء منصة ذكاء اصطناعي وأتمتة خاصة بنا',1),
 ('build_goal','WHATSAPP_API','Add WhatsApp API to our services','إضافة WhatsApp API إلى خدماتنا',2),
 ('build_goal','CLIENT_SOLUTIONS','Offer AI solutions to our clients','تقديم حلول ذكاء اصطناعي لعملائنا',3),
 ('build_goal','NEW_SAAS','Launch a new SaaS product','إطلاق منتج SaaS جديد',4),
 ('build_goal','NEW_OPPORTUNITY','Explore a new business opportunity','البحث عن فرصة عمل جديدة في هذا المجال',5),
 ('build_goal','STILL_EXPLORING','Still exploring','ما زلنا نستكشف',6);
