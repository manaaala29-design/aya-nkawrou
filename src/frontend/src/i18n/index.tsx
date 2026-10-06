import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LANGUAGES,
  type Language,
  type TranslationKey,
  translations,
} from "./translations";

type I18nContextValue = {
  language: Language;
  dir: "ltr" | "rtl";
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "ayankawrou.language";

function readInitialLanguage(): Language {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "ar" || stored === "en") return stored;
  return "fr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  const dir = useMemo(
    () => LANGUAGES.find((entry) => entry.code === language)?.dir ?? "ltr",
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language, dir]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey) =>
      translations[language][key] ?? translations.fr[key],
    [language],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ language, dir, setLanguage, t }),
    [language, dir, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export { LANGUAGES };
export type { Language, TranslationKey };
