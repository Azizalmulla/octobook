# Frontend (Qattan)

Build the Octopus Ai webinar landing page (EN + AR) against the backend API.

## Local API

- Base URL: `http://localhost:3001`
- Docs: see root `README.md`

## Suggested flow

1. `GET /api/sessions`
2. `GET /api/meta/registration-options`
3. User fills form + selects one session
4. `POST /api/registrations` → redirect to `paymentLink`
5. On return, sync payment and show confirmed only if `status === "PAID"`

Put your app in this folder (Next.js / Vite / etc).
