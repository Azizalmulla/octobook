// implements [S6.3] [S6.4] [S6.5] [S7] [S9] [S11.5] [S13.4] [S16]
// Every string displayed in the app lives here, in both languages.
// No dash character and no emoji is permitted in any value.

import type { Lang } from './types'

type Pair = { en: string; ar: string }

export const copy = {
  brand: { en: 'Octopus Ai', ar: 'اوكتوبس ايه اي' },

  langEnglish: { en: 'English', ar: 'English' },
  langArabic: { en: 'العربية', ar: 'العربية' },

  heroEyebrow: { en: 'LIVE WEBINAR', ar: 'ندوة مباشرة' },
  heroHeadline: {
    en: 'Build Your AI and Automation Business',
    ar: 'ابنِ مشروعك في الذكاء الاصطناعي والأتمتة',
  },
  heroSubline: {
    en: 'Learn the strategy behind building and developing AI and Automation solutions for businesses and turning them into scalable technology products and services.',
    ar: 'تعرّف على استراتيجية بناء وتطوير حلول الذكاء الاصطناعي والأتمتة للشركات، وكيفية تحويلها إلى خدمات ومنتجات تقنية قابلة للنمو.',
  },
  markerOne: { en: 'Proven Frameworks and Strategy', ar: 'أطر عمل واستراتيجيات مجربة' },
  markerTwo: { en: 'Practical Tools and Templates', ar: 'أدوات وقوالب عملية' },
  markerThree: { en: 'Scale, Automate and Grow', ar: 'التوسع والأتمتة والنمو' },
  heroAction: { en: 'Register Now', ar: 'سجّل الآن' },
  heroVisualAlt: { en: 'Octopus Ai emblem', ar: 'شعار اوكتوبس ايه اي' },

  sessionsHeading: { en: 'Choose Your Session', ar: 'اختر موعد الدورة' },
  sessionsHelper: { en: 'Please select one session only.', ar: 'يرجى اختيار موعد واحد فقط.' },
  sessionsLoading: { en: 'Loading sessions', ar: 'جارٍ تحميل المواعيد' },
  sessionsFailed: {
    en: 'Sessions could not be loaded. Refresh the page to try again.',
    ar: 'لم يتم تحميل المواعيد. حدّث الصفحة للمحاولة مرة أخرى.',
  },
  soldOut: { en: 'Sold Out', ar: 'مكتمل' },
  seatsLeft: { en: 'seats remaining', ar: 'مقعد متبقٍ' },
  timeRange: { en: 'to', ar: 'إلى' },
  timezoneNote: { en: '(GMT+3)', ar: '(GMT+3)' },
  registrationClosed: {
    en: 'Both sessions are full, so registration is closed for now.',
    ar: 'الموعدان مكتملان، لذلك التسجيل مغلق حالياً.',
  },

  formHeading: { en: 'Register Your Details', ar: 'بيانات التسجيل' },
  formHelper: {
    en: 'Every field is required.',
    ar: 'جميع الحقول مطلوبة.',
  },

  labelFullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  labelCountryCode: { en: 'Country Code', ar: 'رمز الدولة' },
  labelWhatsapp: { en: 'WhatsApp Number', ar: 'رقم الواتساب' },
  labelEmail: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  labelCompany: { en: 'Company Name', ar: 'اسم الشركة' },
  labelCountry: { en: 'Country', ar: 'الدولة' },
  labelBusinessType: { en: 'Business Type', ar: 'مجال عمل الشركة' },
  labelB2b: {
    en: 'Do you currently have B2B clients?',
    ar: 'هل لديكم عملاء من الشركات B2B حالياً؟',
  },
  labelBuildGoal: { en: 'What are you looking to build?', ar: 'ما الذي تهدفون إليه؟' },
  optionYes: { en: 'Yes', ar: 'نعم' },
  optionNo: { en: 'No', ar: 'لا' },
  selectPrompt: { en: 'Select one', ar: 'اختر واحداً' },

  errorFullName: {
    en: 'Enter your first and last name using letters only, at least three characters.',
    ar: 'اكتب اسمك الأول والأخير بالحروف فقط، وبثلاثة أحرف على الأقل.',
  },
  errorCountryCode: {
    en: 'Select the calling code of your number.',
    ar: 'اختر رمز الاتصال الخاص برقمك.',
  },
  errorWhatsapp: {
    en: 'Enter your WhatsApp number in digits, between six and twelve digits, without the country code.',
    ar: 'اكتب رقم الواتساب بالأرقام، بين ستة واثني عشر رقماً، بدون رمز الدولة.',
  },
  errorEmail: {
    en: 'Enter an email address in the form name@company.com',
    ar: 'اكتب بريداً إلكترونياً بالصيغة name@company.com',
  },
  errorCompany: {
    en: 'Enter your company name, at least two characters.',
    ar: 'اكتب اسم شركتك، بحرفين على الأقل.',
  },
  errorCountry: { en: 'Select your country.', ar: 'اختر دولتك.' },
  errorBusinessType: {
    en: 'Select the business type that fits your company.',
    ar: 'اختر مجال العمل الذي يناسب شركتك.',
  },
  errorB2b: {
    en: 'Choose Yes or No so we know your starting point.',
    ar: 'اختر نعم أو لا حتى نعرف نقطة انطلاقكم.',
  },
  errorBuildGoal: {
    en: 'Select the goal closest to what you want to build.',
    ar: 'اختر الهدف الأقرب إلى ما تريدون بناءه.',
  },
  errorSession: {
    en: 'Select one available session above.',
    ar: 'اختر موعداً واحداً متاحاً بالأعلى.',
  },

  paymentHeading: { en: 'Confirm and pay', ar: 'تأكيد والدفع' },
  paymentEyebrow: { en: 'Checkout', ar: 'إتمام التسجيل' },
  paymentHelper: {
    en: 'Review your fee and session, then confirm your seat.',
    ar: 'راجع الرسوم والموعد ثم أكّد مقعدك.',
  },
  paymentSeatLine: { en: 'One seat, one live session.', ar: 'مقعد واحد، جلسة مباشرة واحدة.' },
  paymentNoSession: {
    en: 'Select a session above to continue.',
    ar: 'اختر موعداً بالأعلى للمتابعة.',
  },
  paymentGateLine: {
    en: 'Complete every field above, then press pay. We will jump to anything missing.',
    ar: 'أكمل كل الحقول بالأعلى ثم اضغط ادفع. سننقلك إلى أي نقص.',
  },
  paymentReadyLine: {
    en: 'Ready. Payment opens on the secure gateway.',
    ar: 'جاهز. سيُفتح الدفع على بوابة الدفع الآمنة.',
  },
  paymentAction: { en: 'Pay and Confirm Seat', ar: 'ادفع وأكّد المقعد' },
  paymentWorking: { en: 'Opening payment', ar: 'جارٍ فتح الدفع' },
  paymentSecureNote: {
    en: 'Payment is handled by the gateway. Card details never reach this page.',
    ar: 'تتم عملية الدفع عبر بوابة الدفع. لا تصل بيانات البطاقة إلى هذه الصفحة.',
  },

  errorValidationFailed: {
    en: 'Some details need a correction. The fields above show what to fix.',
    ar: 'بعض البيانات تحتاج تصحيحاً. الحقول بالأعلى توضح ما يجب إصلاحه.',
  },
  errorSessionFull: {
    en: 'That session filled up. Select the other date and try again.',
    ar: 'اكتمل هذا الموعد. اختر التاريخ الآخر وحاول مرة أخرى.',
  },
  errorAlreadyRegistered: {
    en: 'This email already holds a paid seat for that session.',
    ar: 'هذا البريد الإلكتروني يملك مقعداً مدفوعاً في هذا الموعد.',
  },
  errorRateLimited: {
    en: 'Too many attempts from this connection. Wait a few minutes and try again.',
    ar: 'محاولات كثيرة من هذا الاتصال. انتظر بضع دقائق وحاول مرة أخرى.',
  },
  errorPaymentOpen: {
    en: 'Payment could not be opened. Press the button again to retry.',
    ar: 'لم يتم فتح الدفع. اضغط الزر مرة أخرى للمحاولة.',
  },
  errorNetwork: {
    en: 'The connection dropped. Press the button again to retry.',
    ar: 'انقطع الاتصال. اضغط الزر مرة أخرى للمحاولة.',
  },
  errorGeneric: {
    en: 'Something did not complete. Press the button again to retry.',
    ar: 'لم تكتمل العملية. اضغط الزر مرة أخرى للمحاولة.',
  },

  returnChecking: { en: 'Checking your payment', ar: 'جارٍ التحقق من الدفع' },
  returnCheckingNote: {
    en: 'Finish payment in the checkout tab. This page updates automatically when it settles.',
    ar: 'أكمل الدفع في تبويب الدفع. تتحدث هذه الصفحة تلقائياً بعد التسوية.',
  },
  returnPaidHeading: { en: 'Your seat is confirmed.', ar: 'تم تأكيد مقعدك.' },
  returnPaymentNumber: { en: 'Payment number', ar: 'رقم الدفع' },
  returnTrackId: { en: 'Gateway reference', ar: 'مرجع بوابة الدفع' },
  returnSession: { en: 'Session', ar: 'الموعد' },
  returnAmount: { en: 'Amount paid', ar: 'المبلغ المدفوع' },
  returnNotice: {
    en: 'A confirmation is sent to the email address and the WhatsApp number you provided.',
    ar: 'سيتم إرسال تأكيد إلى البريد الإلكتروني ورقم الواتساب الذين قدمتهما.',
  },
  returnPendingHeading: { en: 'Payment is still settling.', ar: 'الدفع في طور التسوية.' },
  returnPendingNote: {
    en: 'Complete checkout in the payment tab. Your seat confirms here automatically after payment.',
    ar: 'أكمل الدفع في تبويب الدفع. يتأكد مقعدك هنا تلقائياً بعد الدفع.',
  },
  returnOpenCheckout: { en: 'Open payment page', ar: 'فتح صفحة الدفع' },
  returnFailedHeading: { en: 'The payment did not complete.', ar: 'لم تكتمل عملية الدفع.' },
  returnFailedNote: {
    en: 'No seat is held and no amount was captured. Start again from the form.',
    ar: 'لم يتم حفظ أي مقعد ولم يُخصم أي مبلغ. ابدأ من النموذج مرة أخرى.',
  },
  returnNeutralHeading: { en: 'Nothing to show on this page.', ar: 'لا يوجد ما يُعرض في هذه الصفحة.' },
  returnNeutralNote: {
    en: 'If you already paid, check WhatsApp for your confirmation. Otherwise return to the form to register.',
    ar: 'إذا كنت قد دفعت بالفعل، تحقق من واتساب للتأكيد. وإلا فعد إلى النموذج للتسجيل.',
  },
  returnBackAction: { en: 'Back to the form', ar: 'العودة إلى النموذج' },

  footerLine: {
    en: '2026 Octopus Ai. All rights reserved.',
    ar: '2026 اوكتوبس ايه اي. جميع الحقوق محفوظة.',
  },
} satisfies Record<string, Pair>

export type CopyKey = keyof typeof copy

export function t(key: CopyKey, lang: Lang): string {
  return copy[key][lang]
}
