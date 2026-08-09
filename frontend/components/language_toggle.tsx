'use client'

// implements [S5.4] two plain text buttons with a dimmed slash that never clicks

import { useLanguage } from './language_provider'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="lang">
      <button
        type="button"
        lang="en"
        className={lang === 'en' ? 'active' : undefined}
        aria-pressed={lang === 'en'}
        onClick={() => setLang('en')}
      >
        English
      </button>
      <span className="divider" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        lang="ar"
        className={lang === 'ar' ? 'active' : undefined}
        aria-pressed={lang === 'ar'}
        onClick={() => setLang('ar')}
      >
        العربية
      </button>
    </div>
  )
}
