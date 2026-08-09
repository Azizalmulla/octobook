// implements [S10.3] amount format and [S10.4] phone format

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Converts Arabic indic digits to Latin digits and drops everything that is not a digit. */
export function digitsOnly(input: string): string {
  let out = ''
  for (const char of input) {
    const arabicIndex = ARABIC_DIGITS.indexOf(char)
    if (arabicIndex >= 0) {
      out += String(arabicIndex)
      continue
    }
    if (char >= '0' && char <= '9') out += char
  }
  return out
}

/** National number without spaces, plus signs, brackets, or leading zeros. */
export function normaliseNationalNumber(input: string): string {
  return digitsOnly(input).replace(/^0+/, '')
}

/** Country calling code and national number joined, no plus sign. Example 96599112233. */
export function toE164Digits(countryCode: string, nationalNumber: string): string {
  return `${digitsOnly(countryCode)}${normaliseNationalNumber(nationalNumber)}`
}

/** Kuwaiti Dinar carries three decimals. 40 becomes 40.000 and never 40 or 40.00. */
export function formatAmount(amount: string | number): string {
  const value = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(value)) return '0.000'
  return value.toFixed(3)
}
