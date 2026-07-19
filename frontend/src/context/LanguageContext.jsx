import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('mediai_lang') || 'en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('mediai_lang', lang);
  };

  const t = (enText, hiText) => language === 'hi' ? (hiText || enText) : enText;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
