'use client'

// implements [S7.2] and [S7.3] every field, required, in both languages

import { useLanguage } from './language_provider'
import { PhoneField, RadioRow, SelectField, TextField } from './form_fields'
import type { FormValues, RegistrationOptions } from '@/lib/types'
import type { FieldErrorMap } from '@/lib/validation'

export function RegistrationForm({
  values,
  errors,
  options,
  onChange,
  onBlur,
}: {
  values: FormValues
  errors: FieldErrorMap
  options: RegistrationOptions
  onChange: <K extends keyof FormValues>(key: K, next: FormValues[K]) => void
  onBlur: (key: keyof FormValues) => void
}) {
  const { text, lang } = useLanguage()
  const isArabic = lang === 'ar'

  const countryOptions = options.countries.map((country) => ({
    value: country.code,
    label: isArabic ? country.nameAr : country.nameEn,
  }))

  // several countries share one dial code, so the country code carries the key
  const dialOptions = options.countries.map((country) => ({
    key: country.code,
    value: country.dialCode,
    label: `${country.dialCode} ${isArabic ? country.nameAr : country.nameEn}`,
  }))

  const businessTypeOptions = options.businessTypes.map((item) => ({
    value: item.code,
    label: isArabic ? item.labelAr : item.labelEn,
  }))

  const buildGoalOptions = options.buildGoals.map((item) => ({
    value: item.code,
    label: isArabic ? item.labelAr : item.labelEn,
  }))

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <TextField
          id="full_name"
          label={text('labelFullName')}
          value={values.full_name}
          error={errors.full_name}
          autoComplete="name"
          maxLength={120}
          onChange={(next) => onChange('full_name', next)}
          onBlur={() => onBlur('full_name')}
        />
      </div>

      <SelectField
        id="whatsapp_country_code"
        label={text('labelCountryCode')}
        value={values.whatsapp_country_code}
        options={dialOptions}
        error={errors.whatsapp_country_code}
        onChange={(next) => onChange('whatsapp_country_code', next)}
        onBlur={() => onBlur('whatsapp_country_code')}
      />

      <PhoneField
        id="whatsapp_number"
        label={text('labelWhatsapp')}
        value={values.whatsapp_number}
        error={errors.whatsapp_number}
        onChange={(next) => onChange('whatsapp_number', next)}
        onBlur={() => onBlur('whatsapp_number')}
      />

      <TextField
        id="email"
        type="email"
        label={text('labelEmail')}
        value={values.email}
        error={errors.email}
        autoComplete="email"
        maxLength={180}
        onChange={(next) => onChange('email', next)}
        onBlur={() => onBlur('email')}
      />

      <TextField
        id="company_name"
        label={text('labelCompany')}
        value={values.company_name}
        error={errors.company_name}
        autoComplete="organization"
        maxLength={120}
        onChange={(next) => onChange('company_name', next)}
        onBlur={() => onBlur('company_name')}
      />

      <SelectField
        id="country"
        label={text('labelCountry')}
        value={values.country}
        options={countryOptions}
        error={errors.country}
        autoComplete="country"
        onChange={(next) => onChange('country', next)}
        onBlur={() => onBlur('country')}
      />

      <SelectField
        id="business_type"
        label={text('labelBusinessType')}
        value={values.business_type}
        options={businessTypeOptions}
        placeholder={text('selectPrompt')}
        error={errors.business_type}
        onChange={(next) => onChange('business_type', next)}
        onBlur={() => onBlur('business_type')}
      />

      <div className="sm:col-span-2">
        <SelectField
          id="build_goal"
          label={text('labelBuildGoal')}
          value={values.build_goal}
          options={buildGoalOptions}
          placeholder={text('selectPrompt')}
          error={errors.build_goal}
          onChange={(next) => onChange('build_goal', next)}
          onBlur={() => onBlur('build_goal')}
        />
      </div>

      <div className="sm:col-span-2">
        <RadioRow
          id="has_b2b_clients"
          label={text('labelB2b')}
          value={values.has_b2b_clients}
          options={[
            { value: 'YES', label: text('optionYes') },
            { value: 'NO', label: text('optionNo') },
          ]}
          error={errors.has_b2b_clients}
          onChange={(next) => onChange('has_b2b_clients', next as FormValues['has_b2b_clients'])}
          onBlur={() => onBlur('has_b2b_clients')}
        />
      </div>
    </div>
  )
}
