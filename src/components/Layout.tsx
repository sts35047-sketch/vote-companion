import { ReactNode } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { Home, Map, HelpCircle, Sun, Moon, Newspaper, MapPin } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/i18n/I18nProvider";

const NAV = [
  { to: "/", labelKey: "Home", icon: Home },
  { to: "/journey", labelKey: "Journey", icon: Map },
  { to: "/booth", labelKey: "Booth", icon: MapPin },
  { to: "/news", labelKey: "News", icon: Newspaper },
  { to: "/faq", labelKey: "FAQ", icon: HelpCircle },
];

function Wordmark({ size = "base" }: { size?: "base" | "sm" }) {
  return (
    <span
      className={`font-display font-bold tracking-[0.08em] gradient-text ${
        size === "sm" ? "text-base" : "text-lg"
      }`}
    >
      FIRSTVOTE
    </span>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const { t } = useT();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav — desktop */}
      <header className="sticky top-0 z-40 hidden md:block">
        <div className="container py-4">
          <nav className="glass-strong rounded-full px-4 py-2.5 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2 pl-2">
              <Wordmark />
            </NavLink>
            <ul className="flex items-center gap-1">
              {NAV.map(({ to, labelKey, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "text-foreground/75 hover:text-foreground hover:bg-foreground/5"
                      }`
                    }
                  >
                    <Icon size={15} /> {t(labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-10 w-10 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Top bar — mobile */}
      <header className="md:hidden sticky top-0 z-40">
        <div className="px-4 pt-4">
          <div className="glass-strong rounded-full px-4 py-2.5 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2">
              <Wordmark size="sm" />
            </NavLink>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-full glass flex items-center justify-center"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pb-32 md:pb-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer — institutional */}
      <footer className="relative z-20 border-t border-border/40 bg-[hsl(var(--background)/0.6)] backdrop-blur-xl mt-auto">
        <div className="container py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Wordmark />
            <p className="font-display text-xs tracking-wider text-muted-foreground/80 mt-2">
              © {new Date().getFullYear()} FirstVote · {t("Secure Civic Infrastructure")}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("Election Ethics")}
            </Link>
            <Link to="/news" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("Transparency Report")}
            </Link>
            <Link to="/booth" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("Security")}
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("Support")}
            </Link>
          </nav>
        </div>
      </footer>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 safe-bottom">
        <ul className="glass-strong rounded-full mx-auto max-w-md flex items-center justify-around p-2">
          {NAV.map(({ to, labelKey, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-2 rounded-full text-[10px] font-semibold min-h-[48px] transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-foreground/70 active:scale-95"
                  }`
                }
              >
                <Icon size={18} />
                {t(labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
