// implements [S11] internal API contract types and the form shape

export type Lang = 'en' | 'ar'

export type SessionItem = {
  id: string
  code: string
  startsAt: string
  endsAt: string
  timezone: string
  labelEn: string
  labelAr: string
  seatsRemaining: number
  isSelectable: boolean
}

export type OptionItem = {
  code: string
  labelEn: string
  labelAr: string
}

export type CountryItem = {
  code: string
  nameEn: string
  nameAr: string
  dialCode: string
}

export type Fee = {
  amount: string
  currency: string
  labelEn: string
  labelAr: string
}

export type RegistrationOptions = {
  fee: Fee
  countries: CountryItem[]
  businessTypes: OptionItem[]
  buildGoals: OptionItem[]
}

// implements [S7.3] field table, machine keys kept exactly as specified
export type FormValues = {
  full_name: string
  whatsapp_country_code: string
  whatsapp_number: string
  email: string
  company_name: string
  country: string
  business_type: string
  has_b2b_clients: '' | 'YES' | 'NO'
  build_goal: string
}

export type FieldKey = keyof FormValues

export type FieldErrors = Partial<Record<FieldKey, string>>

export type CreatedRegistration = {
  registrationId: string
  reference: string
  trackId: string
  paymentLink: string
  status: string
}

export type PaymentStatus = 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'EXPIRED'

export type PaymentSync = {
  trackId: string
  reference: string
  status: PaymentStatus
  paidAt?: string | null
  amount?: string
  currency?: string
  session?: { labelEn: string; labelAr: string }
}

export type ApiFailure = {
  code: string
  fields?: Record<string, string>
}
