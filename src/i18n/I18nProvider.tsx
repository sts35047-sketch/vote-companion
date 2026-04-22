import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export type LangCode =
  | "en" | "hi" | "ta" | "te" | "kn" | "bn" | "mr" | "es" | "fr" | "ar";

export interface LangOption {
  code: LangCode;
  name: string;
  native: string;
  flag: string;
}

export const LANGUAGES: LangOption[] = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
];

interface I18nCtx {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (text: string) => string;
  isRTL: boolean;
  loading: boolean;
}

const Ctx = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: (s) => s,
  isRTL: false,
  loading: false,
});

const STORAGE_KEY = "fv:lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    return saved ?? "en";
  });
  const [loading, setLoading] = useState(false);
  // Per-language cache: text -> translated
  const cacheRef = useRef<Map<LangCode, Map<string, string>>>(new Map());
  // Pending strings collected per tick
  const pendingRef = useRef<Set<string>>(new Set());
  const flushTimerRef = useRef<number | null>(null);
  const [, force] = useState(0);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  // Apply <html lang> + dir
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // Flush pending translations to edge function
  const flush = useCallback(async () => {
    flushTimerRef.current = null;
    if (lang === "en") return;
    const toFetch = Array.from(pendingRef.current);
    pendingRef.current.clear();
    if (toFetch.length === 0) return;

    let langCache = cacheRef.current.get(lang);
    if (!langCache) {
      langCache = new Map();
      cacheRef.current.set(lang, langCache);
    }
    const missing = toFetch.filter((s) => !langCache!.has(s));
    if (missing.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { texts: missing, target: lang },
      });
      if (error) throw error;
      const translations: string[] = data?.translations ?? [];
      missing.forEach((orig, i) => {
        langCache!.set(orig, translations[i] ?? orig);
      });
      force((n) => n + 1);
    } catch (e) {
      // Graceful fallback: keep originals
      console.warn("Translation failed, keeping English:", e);
      missing.forEach((orig) => langCache!.set(orig, orig));
    } finally {
      setLoading(false);
    }
  }, [lang]);

  // Reset pending when lang changes (force re-collection)
  useEffect(() => {
    if (flushTimerRef.current) {
      window.clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    pendingRef.current.clear();
    force((n) => n + 1);
  }, [lang]);

  const t = useCallback(
    (text: string) => {
      if (!text || lang === "en") return text;
      const langCache = cacheRef.current.get(lang);
      const hit = langCache?.get(text);
      if (hit !== undefined) return hit;
      // Schedule fetch (debounced 150ms)
      pendingRef.current.add(text);
      if (flushTimerRef.current == null) {
        flushTimerRef.current = window.setTimeout(flush, 150);
      }
      return text; // Return original until translation arrives
    },
    [lang, flush],
  );

  const value = useMemo<I18nCtx>(
    () => ({ lang, setLang, t, isRTL: lang === "ar", loading }),
    [lang, setLang, t, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT() {
  return useContext(Ctx);
}
