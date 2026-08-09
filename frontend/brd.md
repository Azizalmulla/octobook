# Business Requirements Document

## 1. Business goal

Sell paid seats to a live Octopus Ai webinar titled Build Your AI and Automation Business. A visitor picks one session, completes a required registration form, pays a fixed fee of KWD 40 through AI Collection, and leaves with one unique payment reference that proves the seat.

## 2. Users and their goal on the page

Primary user: a business owner or operator who wants the strategy, tools, and growth path for AI and Automation work. Goal on the page: choose a date, enter details once, pay securely, and receive a clear seat confirmation with a payment number.

## 3. Scope in and scope out

In scope for version one:
one public landing page, English and Arabic parity, two sessions, full required form, fixed fee payment, return page that confirms only after a PAID sync, favicon and social metadata.

Out of scope for version one:
accounts and login, refunds product flow, coupons, CRM sync, blog or about pages, automated email or WhatsApp sending unless the backend owner confirms a provider.

## 4. Commercial rules (fee, currency, refund position, capacity)

Fee is fixed at KWD 40.000. Currency is always KWD with three decimals. The browser never sends an amount. Capacity starts at 100 paid seats per session. When paid seats reach capacity the session card shows Sold Out or مكتمل and cannot be selected. Refunds are handled manually by the business, not inside the product.

## 5. Registration data captured and why each field exists

full_name: identify the attendee on the seat record.
whatsapp_country_code and whatsapp_number: reach the attendee on WhatsApp and build whatsapp_e164 for the gateway phone field.
email: seat uniqueness with session, and a contact channel for confirmation.
company_name: business context for the webinar audience.
country: market context as ISO 3166 alpha 2.
business_type: segment the audience with the codes in the PRD.
has_b2b_clients: starting point for the teaching path.
build_goal: intent for the session content.
session_id: which live date the seat belongs to.
language: which language the visitor used at submit time.

## 6. Payment flow in business language

Visitor completes the form and unlocks Pay and Confirm Seat. The app asks the backend to create a registration and open payment. The backend talks to AI Collection, stores the track id and payment link, then the browser redirects to the gateway. After payment the visitor returns to /return. The app asks the backend to sync. Only a PAID result confirms the seat.

## 7. Confirmation and proof of seat

A seat is confirmed only when registration status equals PAID. The success screen shows the payment number in the OCT form, the chosen session, the amount paid, and a line that a confirmation is sent to the email and WhatsApp provided. Redirect alone never confirms a seat. Pending sync shows a waiting state with the reference and never claims success.

## 8. Languages and markets

English and Arabic with full parity. Arabic sets page content right to left. The navigation pill stays left to right in both languages. The phone number field stays left to right in both languages. Launch market focus is Kuwait and nearby GCC callers, with Kuwait as the default country and 965 as the default calling code.

## 9. Success metrics

A visitor can finish registration and payment on desktop, tablet, and mobile in both languages. Every paid registration exists in the database with a unique reference and a gateway track id. No secret token reaches the browser. The frontend checklist files stay accurate with every change.

## 10. Risks and mitigations

Gateway create fails: show a clear retry line and keep the same idempotency key.
Visitor pays but sync stays pending: show pending copy, poll briefly, never fake PAID.
Duplicate paid email and session: unique index blocks a second paid seat.
Session fills during gateway travel: still mark a paid registration PAID and log overflow for the owner.
Network drop on submit: retry with the same idempotency key.

## 11. Open questions

Will automated email or WhatsApp confirmation ship in version one, and which provider if yes?
Which exact vendor status strings map to PAID, PENDING, FAILED, and EXPIRED once real sandbox responses are captured?
Is PAYMENT_RETURN_URL already configured on the AI Collection account to land on /return with trackId?
Should the frontend keep using local fallbacks in production when the API is down, or show a hard failure only?
Does the backend already expose the [S11] shapes exactly, or are temporary response adapters still needed?

## 12. Change log

2026 08 09 | sections 1 to 12 | Created the business record for the webinar registration frontend | Required by [S4.7] for the first delivery | pending
