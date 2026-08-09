// implements [S18.2c] unit coverage for the phone normaliser and amount formatter

import { describe, expect, it } from 'vitest'
import { digitsOnly, formatAmount, normaliseNationalNumber, toE164Digits } from '../phone'

describe('digitsOnly', () => {
  it('keeps Latin digits and maps Arabic indic digits', () => {
    expect(digitsOnly('+965 99 112 233')).toBe('96599112233')
    expect(digitsOnly('٩٩١١٢٢٣٣')).toBe('99112233')
  })
})

describe('normaliseNationalNumber', () => {
  it('strips spaces, plus signs, and leading zeros', () => {
    expect(normaliseNationalNumber('099112233')).toBe('99112233')
    expect(normaliseNationalNumber('(991) 122 33')).toBe('99112233')
  })
})

describe('toE164Digits', () => {
  it('joins country calling code and national number without a plus sign', () => {
    expect(toE164Digits('965', '099112233')).toBe('96599112233')
  })
})

describe('formatAmount', () => {
  it('always emits three decimals for Kuwaiti Dinar', () => {
    expect(formatAmount(40)).toBe('40.000')
    expect(formatAmount('40')).toBe('40.000')
    expect(formatAmount('40.00')).toBe('40.000')
  })
})
