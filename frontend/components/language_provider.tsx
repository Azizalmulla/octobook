'use client'

// implements [S1.3] and [S5.6] language state, html lang, and page direction

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Lang } from '@/lib/types'
import { copy, type CopyKey } from '@/lib/copy'

type LanguageValue = {
  lang: Lang
  isArabic: boolean
  setLang: (next: Lang) => void
  text: (key: CopyKey) => string
}

const LanguageContext = createContext<LanguageValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('lang', lang)
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      isArabic: lang === 'ar',
      setLang,
      text: (key: CopyKey) => copy[key][lang],
    }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageValue {
  const found = useContext(LanguageContext)
  if (!found) throw new Error('useLanguage must be used inside LanguageProvider')
  return found
}
