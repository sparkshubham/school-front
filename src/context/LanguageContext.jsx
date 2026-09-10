import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('edunest_lang') || 'hi');

  function setLang(next) {
    setLangState(next);
    localStorage.setItem('edunest_lang', next);
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    document.title = lang === 'hi' ? 'EduNest — विद्यालय ERP' : 'EduNest — School ERP';
  }, [lang]);

  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';

  const t = useMemo(() => {
    return (key, vars = {}) => {
      const table = translations[lang] || translations.en;
      let str = table[key] ?? translations.en[key] ?? key;
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replaceAll(`{${k}}`, String(v ?? ''));
      });
      return str;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, locale }), [lang, t, locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
