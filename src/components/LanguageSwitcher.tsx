import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { LANGUAGES, useT, type LangCode } from "@/i18n/I18nProvider";
import { motion, AnimatePresence } from "framer-motion";

export function LanguageSwitcher() {
  const { lang, setLang, loading } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed z-50 bottom-24 right-4 md:bottom-6 md:right-6"
    >
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-[calc(100%+0.6rem)] right-0 glass-strong rounded-2xl p-2 min-w-[200px] max-h-[60vh] overflow-y-auto"
            role="listbox"
          >
            {LANGUAGES.map((l) => {
              const active = l.code === lang;
              return (
                <li key={l.code}>
                  <button
                    onClick={() => {
                      setLang(l.code as LangCode);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-gradient-accent text-accent-foreground"
                        : "hover:bg-foreground/10 text-foreground"
                    }`}
                    aria-selected={active}
                    role="option"
                  >
                    <span className="text-lg leading-none">{l.flag}</span>
                    <span className="flex-1 text-left">{l.native}</span>
                    {active && <Check size={16} />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="glass-strong rounded-full pl-2 pr-4 py-2 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-3d"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-accent text-accent-foreground text-base">
          {loading ? (
            <Globe size={16} className="animate-spin" />
          ) : (
            current.flag
          )}
        </span>
        <span className="text-sm font-semibold hidden sm:inline">
          {current.native}
        </span>
        <span className="text-sm font-semibold sm:hidden">
          {current.code.toUpperCase()}
        </span>
      </button>
    </div>
  );
}
