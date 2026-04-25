import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles, ShieldCheck, Vote, BarChart3 } from "lucide-react";

import { useSEO } from "@/hooks/useSEO";
import { NewsStrip } from "@/components/NewsStrip";
import { T } from "@/i18n/T";
import { withRipple } from "@/lib/ripple";

const FEATURE_CARDS = [
  {
    Icon: ShieldCheck,
    title: "Before You Vote",
    text: "Eligibility, registration, documents, and the calm prep nobody told you about.",
    delay: 0,
  },
  {
    Icon: Vote,
    title: "Inside The Booth",
    text: "Exactly what you'll see, hear and do — step by step, no surprises.",
    delay: 0.1,
  },
  {
    Icon: BarChart3,
    title: "After You Vote",
    text: "Confirming your vote counted and what happens next in the count.",
    delay: 0.2,
  },
];

export default function Index() {
  useSEO({
    title: "FirstVote — Your friendly first-time voter companion",
    description:
      "Walk through every step of voting in 13 friendly steps. Built for first-time voters — zero judgment, zero confusion.",
  });

  return (
    <T>
      <div className="relative">
        {/* Hero */}
        <section className="relative min-h-[calc(100vh-7rem)] md:min-h-[calc(100vh-5rem)] flex items-center">
          <div className="container py-12 md:py-20 relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold mb-6 label-caps">
                <Sparkles size={12} className="text-secondary" /> Made for first-time voters
              </span>

              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.02] tracking-[-0.02em] text-balance">
                Your First Vote <br className="hidden sm:block" />
                <span className="gradient-text">Shouldn't Be Scary</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                A calm, judgment-free guide for the moment that matters. Walk through every step at your own pace — built like the secure infrastructure your vote deserves.
              </p>

              <motion.div
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
              >
                <Link to="/journey" onClick={withRipple()} className="btn-3d ripple-host pulse-glow w-full sm:w-auto">
                  Start your journey <ArrowRight size={18} />
                </Link>
                <Link to="/faq" onClick={withRipple()} className="btn-ghost-3d ripple-host w-full sm:w-auto">
                  Read the FAQ
                </Link>
              </motion.div>
            </motion.div>

            {/* Feature glass cards */}
            <div className="mt-14 md:mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_CARDS.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + c.delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8 }}
                  className="glass rounded-[2rem] p-7 relative overflow-hidden"
                >
                  <div
                    aria-hidden
                    className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-30 blur-2xl"
                    style={{
                      background:
                        i % 2 ? "var(--gradient-accent)" : "var(--gradient-primary)",
                    }}
                  />
                  <div className="icon-chip h-14 w-14 mb-5">
                    <c.Icon size={24} className="text-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Scroll indicator */}
            <motion.div
              aria-hidden
              className="mt-14 flex justify-center"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="glass rounded-full h-10 w-10 flex items-center justify-center text-muted-foreground">
                <ChevronDown size={20} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why this exists */}
        <section className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-5 tracking-tight text-balance">
              Designed for the <span className="gradient-text">human</span> in the booth
            </h2>
            <p className="text-muted-foreground md:text-lg leading-relaxed">
              Most voting guides assume you already know what to do. We don't. We meet you where you are — nervous, curious, or just here to figure things out.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              { k: "13", v: "Friendly steps" },
              { k: "3", v: "Phases — before, inside, after" },
              { k: "0", v: "Judgment, ever" },
            ].map((stat) => (
              <div key={stat.v} className="glass rounded-[2rem] p-7 text-center">
                <div className="font-display text-5xl font-bold gradient-text mb-2">{stat.k}</div>
                <div className="text-xs label-caps text-muted-foreground">{stat.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link to="/journey" onClick={withRipple()} className="btn-3d ripple-host">
              Begin step 1 <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Live election news strip */}
        <NewsStrip />
      </div>
    </T>
  );
}
