import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Map, HelpCircle, Sun, Moon, Vote, Newspaper, MapPin } from "lucide-react";
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

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const { t } = useT();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav — desktop */}
      <header className="sticky top-0 z-40 hidden md:block">
        <div className="container py-4">
          <nav className="glass-strong rounded-2xl px-4 py-3 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-accent text-accent-foreground shadow-glow">
                <Vote size={18} />
              </span>
              <span className="gradient-text-primary">First Vote</span>
            </NavLink>
            <ul className="flex items-center gap-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-accent text-accent-foreground shadow-glow"
                          : "hover:bg-foreground/5"
                      }`
                    }
                  >
                    <Icon size={16} /> {label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:scale-105 transition-transform"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Top bar — mobile */}
      <header className="md:hidden sticky top-0 z-40">
        <div className="px-4 pt-4">
          <div className="glass-strong rounded-2xl px-4 py-3 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2 font-bold">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent text-accent-foreground shadow-glow">
                <Vote size={14} />
              </span>
              <span className="gradient-text-primary">First Vote</span>
            </NavLink>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-xl glass flex items-center justify-center"
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
            className="pb-28 md:pb-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 safe-bottom">
        <ul className="glass-strong rounded-2xl mx-auto max-w-md flex items-center justify-around p-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-semibold min-h-[48px] transition-all ${
                    isActive
                      ? "bg-gradient-accent text-accent-foreground shadow-glow"
                      : "text-foreground/70 active:scale-95"
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
