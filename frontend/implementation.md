# Implementation Checklist

## 0. How to use this file

Read this file end to end before writing a single line of code in this app.
Then restate, in one short block, which checklist entries apply to the task in
front of you. Reuse the component, token, hook, or pattern listed here instead
of writing a second version of the same thing. Only when nothing listed fits,
create something new, and add it to the registry in section 5 and to the change
log in section 16 inside the same change. This applies when you add a new
section and when you edit an existing one.

Precedence, highest first, per [S0.3]: the PRD, then this file, then brd.md,
then existing code, then agent defaults.

Writing rule in force everywhere, per [S0.5] and [S0.6]: no dash character in
prose, in UI copy in either language, in code comments, or in these two
markdown files. Rephrase instead. Dash characters stay only inside URLs,
endpoint paths, CSS property names, npm package names, and the delimiter row
of a markdown table, which is syntax rather than prose. No emoji anywhere.

## 1. Stack and versions

Framework: Next.js 16, App Router, TypeScript, React 19.
Styling: Tailwind CSS 4 for layout and spacing utilities only, plus hand
written token driven CSS in app/globals.css for every color and every surface.
Icons: @tabler/icons-react, outline family only.
Data: native fetch inside one api client module, no ORM, no backend code.
Fonts: one combined Google Fonts link carrying Plus Jakarta Sans and IBM Plex
Sans Arabic, present in every head in the project.
Tests: vitest for the phone normaliser, amount formatter, and payment gate.
Environment: NEXT_PUBLIC_API_BASE_URL, local value http://localhost:3001.
No secret variable exists in this app.

## 2. File and folder map

    app/layout.tsx              root layout, font link, metadata, html lang
    app/globals.css             tokens, glass recipe, ground classes, motion
    app/page.tsx                landing route, section order per [S6.2]
    app/return/page.tsx         payment return route per [S14]
    app/manifest.webmanifest/route.ts
    components/language_provider.tsx
    components/nav_pill.tsx
    components/language_toggle.tsx
    components/glass_card.tsx
    components/section_shell.tsx
    components/reveal.tsx
    components/hero.tsx
    components/registration_flow.tsx
    components/session_select.tsx
    components/registration_form.tsx
    components/form_fields.tsx
    components/payment_block.tsx
    components/footer_line.tsx
    components/return_result.tsx
    lib/api_client.ts           every network call in the app
    lib/types.ts                API and form types
    lib/copy.ts                 every string in English and Arabic
    lib/fallbacks.ts            local development option fallback
    lib/validation.ts           field rules and the gate rule
    lib/phone.ts                phone normaliser and amount formatter
    lib/scroll.ts               smooth scroll with a soft fade
    lib/__tests__/phone.test.ts
    lib/__tests__/gate.test.ts
    scripts/prepare_logo.mjs    logo trim, square, icon export
    scripts/compress_images.mjs keep public PNG files under 500 KB
    assets/source/logo_source.png  source mark, not served
    migrations/001_webinar_schema.sql  plain SQL from [S12] for Neon
    public/                     served PNG assets, see section 12

File names use lowercase letters and underscores. No dash character in a file
name that this app owns.

## 3. Design tokens

Defined once in app/globals.css under :root. Nothing else declares a color
inside a CSS rule, utility, or inline style.

    --brand    light blue accent, calls to action, price, focus ring, icons
    --neutral  light text and glass tint
    --glow     top inner highlight on glass
    --shade    depth shadow and dark ground

Usage map, per [S5.1]:

| Purpose | Value |
|:--|:--|
| page dark ground | var(--shade) |
| light section ground | color-mix(in srgb, var(--neutral) 96%, var(--shade)) |
| body text on dark | var(--neutral) |
| body text on light | color-mix(in srgb, var(--shade) 78%, transparent) |
| primary action and price | var(--brand) |
| softer tint of anything | color-mix on a token |

Rule: no hex, no rgb, no rgba, no hsl, no named color, no Tailwind color
utility such as bg-white or text-black anywhere in this app. A literal color in
the output is a defect. Manifest and viewport themeColor are the only exception
and they reuse the --shade palette value because those formats require a concrete
color string.

## 4. Typography rules

    --font-latin   "Plus Jakarta Sans", system-ui, sans-serif
    --font-arabic  "IBM Plex Sans Arabic", var(--font-latin), sans-serif

Never name a font family inline in a rule. Arabic is forced at html level so
the body rule cannot drop Arabic to a system fallback. Latin tracking, word
spacing, and text transform are cancelled on any Arabic or right to left
subtree. Arabic body copy uses a line height of 1.9. English tracking values
are unchanged by any of this and were verified after the Arabic rules landed.

Scale in use: display clamp for the headline, 1.0625rem for body copy, 0.8125rem
for the language toggle, labels, and helper lines.

## 5. Components registry

| Component name | File path | Purpose | Props | Where used | Status |
|:--|:--|:--|:--|:--|:--|
| LanguageProvider | components/language_provider.tsx | Holds the active language, writes lang and dir on html, exposes useLanguage | children | app/layout.tsx | STABLE |
| NavPill | components/nav_pill.tsx | Floating contained pill at the top, language toggle only | none | app/layout.tsx | STABLE |
| LanguageToggle | components/language_toggle.tsx | Two plain text buttons English and العربية with a dimmed slash | none | NavPill | STABLE |
| GlassCard | components/glass_card.tsx | The single liquid glass surface for every card and panel | tone, as, className, children, id | Hero, SessionSelect, RegistrationForm, PaymentBlock, ReturnResult | STABLE |
| SectionShell | components/section_shell.tsx | Section wrapper with one background image, ground tone, scrim, and reveal | id, ground, image, priority, className, children | app/page.tsx, RegistrationFlow, ReturnResult | STABLE |
| Reveal | components/reveal.tsx | Slide down entrance on first view, respects reduced motion | delay, className, children | SectionShell, Hero, RegistrationFlow, PaymentBlock, ReturnResult | STABLE |
| Hero | components/hero.tsx | Eyebrow, headline, subline, three value markers, hero subject, primary action | none | app/page.tsx | STABLE |
| RegistrationFlow | components/registration_flow.tsx | Owns session state, field state, options, fee, submit, and the payment gate | none | app/page.tsx | STABLE |
| SessionSelect | components/session_select.tsx | Two radio cards, exactly one selectable, sold out state | sessions, value, onSelect, loading, failed, error, onBlur | RegistrationFlow | STABLE |
| RegistrationForm | components/registration_form.tsx | Every required field with labels in both languages | values, errors, options, onChange, onBlur | RegistrationFlow | STABLE |
| TextField, SelectField, RadioRow, PhoneField | components/form_fields.tsx | Field primitives with real labels, aria describedby, and error lines | id, label, value, error, onChange, onBlur, plus per field extras | RegistrationForm | STABLE |
| PaymentBlock | components/payment_block.tsx | Fee figure, gate line, payment action, request failure line | fee, gateOpen, submitting, closed, failure, onPay | RegistrationFlow | STABLE |
| FooterLine | components/footer_line.tsx | One centered line of small muted text, no card | none | app/page.tsx, app/return/page.tsx | STABLE |
| ReturnResult | components/return_result.tsx | Syncs and polls the payment status, renders paid, pending, failed, neutral | none | app/return/page.tsx | STABLE |

No other card component exists. Card discipline per [S5.10]: few surfaces,
generous space between them.

## 6. Layout and spacing scale

Content width: 72rem maximum, 1.25rem gutter on mobile, 2rem from the medium
breakpoint. Section rhythm: 6rem block padding on mobile, 8rem from the medium
breakpoint. Gaps come from Tailwind gap utilities on the spacing scale. Margin
and padding are never mixed with gap on the same element. Radius: 999px for the
pill, 1.5rem for large glass surfaces, 0.875rem for inputs. Hero text sits low
with room above it on the first viewport.

## 7. Animation and motion rules

Entrances read as slide down: the element starts higher and lower in opacity,
then settles. One IntersectionObserver per Reveal, fires once.
Navigation and call to action clicks smooth scroll to the target section with a
soft fade during travel, on desktop and on mobile, implemented in lib/scroll.ts.
Reduced motion: transforms and the fade are disabled and the target is reached
immediately, opacity only.

## 8. Forms and validation patterns

Every field is required, per [S7.1]. Validation runs on blur and again on
submit, never on a keystroke before the first blur. Errors sit under the field,
in the active language, state what is wrong and how to fix it, never apologise,
and are linked with aria describedby while the input carries aria invalid true.
Rules live in lib/validation.ts as one function per field key plus one
validateAll function. The gate rule from [S9.2] lives in the same file as
isGateOpen. Phone normalisation and the three decimal amount format live in
lib/phone.ts. Autocomplete attributes are set for name, tel, email,
organization, and country. The number field opens the numeric keypad and keeps
its input direction left to right in both languages.

## 9. State management and data fetching

React state only. No global store. RegistrationFlow owns session id, field
values, touched flags, errors, submit state, and one idempotency key generated
once per form fill and reused on retry of an unchanged form. Language lives in
LanguageProvider. Switching language never clears the form. Sessions and
options load in parallel on mount.

## 10. API client and error handling

Every request goes through lib/api_client.ts. No component calls fetch
directly. Base URL from NEXT_PUBLIC_API_BASE_URL. Timeout of 20 seconds. One
retry on network failure for GET only. POST is never auto retried.

    GET  /api/sessions
    GET  /api/meta/registration-options
    POST /api/registrations
    POST /api/payments/:trackId/sync

Error envelope { error, message, fields }. The client maps the error code to a
localised message from lib/copy.ts and never shows a raw backend message.
Field level errors from a 400 render on the matching fields.
Vendor status strings observed in a real gateway response are recorded here the
first time they are seen. None observed yet.

## 11. Internationalisation and RTL rules

Two languages, full parity, every string in lib/copy.ts with an en key and an
ar key. Arabic sets dir rtl on html for page content. The navigation pill stays
left to right in both languages. The phone number input stays left to right in
both languages. The language field sent to the backend is the language active
at the moment of submit.

## 12. Assets and image files

Images are supplied by the human and are never generated. Every file is PNG,
served through the Next.js image optimizer, and stays under 500 KB. The chrome
octopus render is the only logo source. It is processed by scripts/prepare_logo.mjs
and never redrawn.

| File | Use | Present |
|:--|:--|:--|
| assets/source/logo_source.png | source mark, not served | yes |
| public/logo.png | favicon and metadata mark, 512 by 512, transparent | yes |
| public/icon_192.png | manifest icon | yes |
| public/icon_512.png | manifest icon | yes |
| public/apple_icon.png | apple touch icon on solid --shade ground | yes |
| public/favicon.ico | 16, 32, and 48 sizes | yes |
| public/octopus_hero.png | hero subject, transparent | soft token tinted placeholder until uploaded |
| public/hero_bg.png | hero background | yes |
| public/sessions_bg.png | session section background | yes |
| public/form_bg.png | registration section background | yes |
| public/payment_bg.png | fee and payment section background | yes |
| public/og_share.png | social preview, not the logo | yes |

The logo never appears in the navigation and never appears in the hero.

## 13. Accessibility floor

Real label elements bound by id. Visible keyboard focus ring in var(--brand).
aria describedby on every error, aria invalid on the input in error.
aria disabled on the payment action while the gate is closed. Text contrast of
at least 4.5 to 1, including over glass and over imagery, held by a token
derived scrim behind text on every background image. The whole form is
completable by keyboard alone in both languages. Reduced motion respected.

## 14. Naming conventions

Files: lowercase with underscores. Components: PascalCase. Hooks: useThing.
Form keys match the PRD keys exactly, snake case in the form state and camel
case in the request body per [S11.3]. Section ids: nav, hero, sessions,
register, payment, footer. Code comments cite the PRD section, for example
// implements [S9.2] payment gate.

## 15. Do not do list

Never write a literal color in CSS, utilities, or inline styles. Never write a
dash character in prose or UI copy. Never use an emoji. Never generate an image
or a logo. Never place the logo in the navigation or in the hero. Never add a
section link, a brand name, or a call to action to the navigation pill. Never
render a contact block, an email label, a phone label, a location label, a
powered by line, or a footer card. Never call fetch from a component. Never
call the payment gateway from the browser. Never send an amount from the
browser. Never hold a token in the browser. Never hardcode sessions, fees, or
option labels when the API answers. Never show a confirmation on redirect
alone. Never trust a query string parameter to decide payment status. Never
multiply cards. Never mention Vercel.

## 16. Change log

2026 08 09 | sections 1 to 15 | Created this file and built the first pass of the landing route and the payment return route | Initial delivery of [S4] through [S17] | pending
2026 08 09 | sections 1, 2, 5, 10, 12 | Moved app under frontend/, swapped to Google Fonts link, logo pipeline, return polling, SQL migration, tests | Align delivery with [S5] [S12] [S14] [S18] [S19] | pending
