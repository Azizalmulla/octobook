// implements [S7.6] typed FALLBACK for local development only.
// The API is the source of truth. These values are used only when
// GET /api/meta/registration-options does not answer, and they are never
// treated as authoritative.

import type { CountryItem, Fee, OptionItem, RegistrationOptions, SessionItem } from './types'

// FALLBACK sessions for local development only, matching the codes in [S8.1].
// GET /api/sessions is the source of truth the moment it answers.
export const FALLBACK_SESSIONS: SessionItem[] = [
  {
    id: 'fallback_session_thu',
    code: 'SESSION_THU_2026_09_03',
    startsAt: '2026-09-03T16:00:00.000Z',
    endsAt: '2026-09-03T18:00:00.000Z',
    timezone: 'Asia/Kuwait',
    labelEn: 'Thursday 3 September 2026',
    labelAr: 'الخميس 3 سبتمبر 2026',
    seatsRemaining: 100,
    isSelectable: true,
  },
  {
    id: 'fallback_session_sun',
    code: 'SESSION_SUN_2026_09_06',
    startsAt: '2026-09-06T16:00:00.000Z',
    endsAt: '2026-09-06T18:00:00.000Z',
    timezone: 'Asia/Kuwait',
    labelEn: 'Sunday 6 September 2026',
    labelAr: 'الأحد 6 سبتمبر 2026',
    seatsRemaining: 100,
    isSelectable: true,
  },
]

export const FALLBACK_FEE: Fee = {
  amount: '0.300',
  currency: 'KWD',
  labelEn: '300 fils',
  labelAr: '300 فلس',
}

export const FALLBACK_BUSINESS_TYPES: OptionItem[] = [
  { code: 'TECHNOLOGY_SOFTWARE', labelEn: 'Technology and Software', labelAr: 'تقنية وبرمجيات' },
  { code: 'DIGITAL_AGENCY', labelEn: 'Digital Agency', labelAr: 'وكالة رقمية' },
  { code: 'AI_AUTOMATION', labelEn: 'AI and Automation', labelAr: 'ذكاء اصطناعي وأتمتة' },
  { code: 'MARKETING_AGENCY', labelEn: 'Marketing Agency', labelAr: 'وكالة تسويق' },
  { code: 'STARTUP', labelEn: 'Startup', labelAr: 'شركة ناشئة' },
  { code: 'OTHER', labelEn: 'Other', labelAr: 'أخرى' },
]

export const FALLBACK_BUILD_GOALS: OptionItem[] = [
  {
    code: 'OWN_AI_AUTOMATION_PLATFORM',
    labelEn: 'Build our own AI and Automation platform',
    labelAr: 'بناء منصة ذكاء اصطناعي وأتمتة خاصة بنا',
  },
  {
    code: 'ADD_WHATSAPP_API',
    labelEn: 'Add WhatsApp API to our services',
    labelAr: 'إضافة WhatsApp API إلى خدماتنا',
  },
  {
    code: 'OFFER_AI_SOLUTIONS',
    labelEn: 'Offer AI solutions to our clients',
    labelAr: 'تقديم حلول ذكاء اصطناعي لعملائنا',
  },
  {
    code: 'LAUNCH_SAAS_PRODUCT',
    labelEn: 'Launch a new SaaS product',
    labelAr: 'إطلاق منتج SaaS جديد',
  },
  {
    code: 'EXPLORE_BUSINESS_OPPORTUNITY',
    labelEn: 'Explore a new business opportunity',
    labelAr: 'البحث عن فرصة عمل جديدة في هذا المجال',
  },
  { code: 'STILL_EXPLORING', labelEn: 'Still exploring', labelAr: 'ما زلنا نستكشف' },
]

export const FALLBACK_COUNTRIES: CountryItem[] = [
  { code: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت', dialCode: '965' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية', dialCode: '966' },
  { code: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات', dialCode: '971' },
  { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر', dialCode: '974' },
  { code: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين', dialCode: '973' },
  { code: 'OM', nameEn: 'Oman', nameAr: 'عمان', dialCode: '968' },
  { code: 'IQ', nameEn: 'Iraq', nameAr: 'العراق', dialCode: '964' },
  { code: 'JO', nameEn: 'Jordan', nameAr: 'الأردن', dialCode: '962' },
  { code: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان', dialCode: '961' },
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', dialCode: '20' },
  { code: 'MA', nameEn: 'Morocco', nameAr: 'المغرب', dialCode: '212' },
  { code: 'TN', nameEn: 'Tunisia', nameAr: 'تونس', dialCode: '216' },
  { code: 'DZ', nameEn: 'Algeria', nameAr: 'الجزائر', dialCode: '213' },
  { code: 'TR', nameEn: 'Turkey', nameAr: 'تركيا', dialCode: '90' },
  { code: 'GB', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', dialCode: '44' },
  { code: 'US', nameEn: 'United States', nameAr: 'الولايات المتحدة', dialCode: '1' },
  { code: 'CA', nameEn: 'Canada', nameAr: 'كندا', dialCode: '1' },
  { code: 'DE', nameEn: 'Germany', nameAr: 'ألمانيا', dialCode: '49' },
  { code: 'FR', nameEn: 'France', nameAr: 'فرنسا', dialCode: '33' },
  { code: 'IN', nameEn: 'India', nameAr: 'الهند', dialCode: '91' },
  { code: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان', dialCode: '92' },
]

export const FALLBACK_OPTIONS: RegistrationOptions = {
  fee: FALLBACK_FEE,
  countries: FALLBACK_COUNTRIES,
  businessTypes: FALLBACK_BUSINESS_TYPES,
  buildGoals: FALLBACK_BUILD_GOALS,
}
