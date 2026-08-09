# Octokiss Backend

Webinar registration API for **Octopus Ai** with **AI Collection** payments (KWD 40).

Qattan owns frontend. This repo folder (`backend/`) owns API, DB, and payments.

## Stack

- Node.js 20+ / TypeScript
- Fastify
- PostgreSQL + Prisma
- AI Collection (`create_payment` + `get_custom_payments`)

## Frontend (Qattan)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend: `http://localhost:3000`  
API base: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3001`)

After payment, open `/return` (track id is stored before redirect).

## Quick start

```bash
# from repo root
docker compose up -d

cd backend
cp .env.example .env
# paste AI_COLLECTION_BEARER_TOKEN and WHATSAPP_TEMPLATE_TOKEN into .env

pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

API: `http://localhost:3001`  
Health: `GET /health`

## Frontend integration (for Qattan)

Base URL (local): `http://localhost:3001`

### 1. Load sessions

`GET /api/sessions`

### 2. Load form option labels (EN/AR)

`GET /api/meta/registration-options`

### 3. Register + create payment

`POST /api/registrations`

```json
{
  "fullName": "Aziz Al Mulla",
  "whatsappNumber": "96550000000",
  "email": "aziz@example.com",
  "companyName": "Octopus Ai",
  "country": "Kuwait",
  "businessType": "AI_AUTOMATION",
  "hasB2bClients": true,
  "buildGoal": "OFFER_AI_SOLUTIONS",
  "sessionId": "<id from /api/sessions>",
  "locale": "en",
  "paymentGateway": "KNET"
}
```

Response includes:

- `data.paymentLink` → redirect user here
- `data.trackId` → keep for status checks
- `data.registration.id`

### 4. After user returns from payment

`POST /api/payments/:trackId/sync`  
or  
`GET /api/payments/:trackId/status`  
or  
`POST /api/registrations/:id/sync-payment`

Seat is confirmed when `registration.status === "PAID"`.

On `PAID`, backend also sends the approved WhatsApp confirmation template to `whatsappNumber`
(`{{1}}` name, `{{2}}` session, `{{3}}` amount).

## Payment test cards (AI Collection)

**KNET**

- Bank: knet test card
- Card: `0000000001`
- Expiry: `09/25`
- PIN: `1234`

**Visa/Master**

- Name: anything
- Card: `5457 2100 0100 0019`
- MM/YY: `12/25`
- CVV: `212`

## Collaboration

| Person | Area | Suggested branch |
|--------|------|------------------|
| Aziz | Backend | `backend/*` |
| Qattan | Frontend | `frontend/*` |

Keep `main` deployable. Open PRs into `main`.

## Env vars

See `.env.example`. Never commit real bearer tokens.
