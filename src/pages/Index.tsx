import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, CalendarCheck2, Landmark, CheckCircle2, Sparkles } from "lucide-react";
import { FloatingParticles } from "@/components/FloatingParticles";
import { useSEO } from "@/hooks/useSEO";

const FEATURE_CARDS = [
  {
    emoji: "📅",
    title: "Before You Vote",
    text: "Eligibility, registration, documents, and the calm prep nobody told you about.",
    Icon: CalendarCheck2,
    delay: 0,
  },
  {
    emoji: "🏛️",
    title: "Inside The Booth",
    text: "Exactly what you'll see, hear and do — step by step, no surprises.",
    Icon: Landmark,
    delay: 0.1,
  },
  {
    emoji: "✅",
    title: "After You Vote",
    text: "Confirming your vote counted and what happens next in the count.",
    Icon: CheckCircle2,
    delay: 0.2,
  },
];

export default function Index() {
  useSEO({
    title: "First Vote — Your friendly first-time voter companion",
    description:
      "Walk through every step of voting in 13 friendly steps. Built for first-time voters — zero judgment, zero confusion.",
  });

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-7rem)] md:min-h-[calc(100vh-5rem)] flex items-center">
        <FloatingParticles count={18} />

        {/* Parallax depth blobs */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-gradient-accent blur-3xl opacity-30 float-y-slow" />
          <div className="absolute top-40 -right-10 h-80 w-80 rounded-full bg-gradient-primary blur-3xl opacity-30 float-y" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-gradient-accent blur-3xl opacity-20 float-y-fast" />
        </div>

        <div className="container py-12 md:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium mb-6">
              <Sparkles size={14} className="text-accent" /> Made for first-time voters
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Your First Vote <br className="hidden sm:block" />
              <span className="gradient-text">Shouldn't Be Scary</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Walk through every step, zero judgment, zero confusion. Just a calm, warm guide for the moment that matters.
            </p>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <Link to="/journey" className="btn-3d pulse-glow w-full sm:w-auto">
                Start your journey <ArrowRight size={18} />
              </Link>
              <Link to="/faq" className="btn-ghost-3d w-full sm:w-auto">
                Read the FAQ
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating glass cards */}
          <div className="mt-14 md:mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30, rotateX: 8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.3 + c.delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass rounded-3xl p-6 md:p-7 relative overflow-hidden"
                style={{ transformStyle: "preserve-3d" as const }}
              >
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
                  style={{ background: i % 2 ? "var(--gradient-accent)" : "var(--gradient-primary)" }}
                />
                <div className="text-5xl mb-4 float-y inline-block" style={{ animationDelay: `${i * 0.6}s` }}>
                  {c.emoji}
                </div>
                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Designed for the <span className="gradient-text">human</span> in the booth
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Most voting guides assume you already know what to do. We don't. We meet you where you are — nervous,
            curious, or just here to figure things out.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3 max-w-4xl mx-auto">
          {[
            { k: "13", v: "Friendly steps" },
            { k: "3", v: "Phases — before, inside, after" },
            { k: "0", v: "Judgment, ever" },
          ].map((stat) => (
            <div key={stat.v} className="glass rounded-3xl p-6 text-center">
              <div className="text-5xl font-extrabold gradient-text mb-2">{stat.k}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/journey" className="btn-3d">
            Begin step 1 <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
