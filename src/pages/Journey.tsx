import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Lightbulb, Trophy, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { CardSkeleton } from "@/components/Skeleton";
import { getLocalProgress, setLocalProgress, getSessionId, markCompleted } from "@/lib/session";
import { toast } from "sonner";

interface Step {
  id: number;
  phase: string;
  step_number: number;
  title: string;
  description: string;
  pro_tip: string | null;
  emoji: string | null;
}

const PHASE_META: Record<string, { emoji: string; color: string }> = {
  "Before You Vote": { emoji: "🗓️", color: "from-primary to-secondary" },
  "Inside The Booth": { emoji: "🏛️", color: "from-secondary to-primary" },
  "After You Vote": { emoji: "✅", color: "from-accent to-accent-2" },
};

export default function Journey() {
  useSEO({
    title: "Journey — First Vote",
    description: "13 friendly steps walking you through everything from registration to results.",
  });

  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<number>(getLocalProgress());
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("voting_steps")
        .select("*")
        .order("step_number", { ascending: true });
      if (cancelled) return;
      if (error) {
        toast.error("Couldn't load steps. Please refresh.");
        setLoading(false);
        return;
      }
      setSteps((data ?? []) as Step[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist progress (local + remote)
  useEffect(() => {
    setLocalProgress(current);
    const sid = getSessionId();
    supabase
      .from("user_progress")
      .upsert({ session_id: sid, current_step: current }, { onConflict: "session_id" })
      .then(() => undefined);
  }, [current]);

  const total = steps.length || 13;
  const step = steps.find((s) => s.step_number === current);
  const percent = Math.round((current / total) * 100);

  const phasesGrouped = useMemo(() => {
    const groups: Record<string, Step[]> = {};
    for (const s of steps) {
      groups[s.phase] = groups[s.phase] ?? [];
      groups[s.phase].push(s);
    }
    return groups;
  }, [steps]);

  const goNext = () => {
    if (current >= total) {
      finish();
      return;
    }
    setCurrent((c) => Math.min(total, c + 1));
  };
  const goPrev = () => setCurrent((c) => Math.max(1, c - 1));

  const finish = async () => {
    markCompleted();
    const sid = getSessionId();
    await supabase
      .from("user_progress")
      .upsert(
        { session_id: sid, current_step: total, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "session_id" }
      );
    navigate("/complete");
  };

  const onSwipe = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
  };

  return (
    <div className="container pt-6 md:pt-10">
      {/* Progress */}
      <div className="glass rounded-3xl p-5 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your progress</div>
            <div className="text-lg md:text-xl font-bold">
              Step {current} of {total} · <span className="gradient-text">{percent}%</span>
            </div>
          </div>
          <button onClick={finish} className="btn-ghost-3d hidden sm:inline-flex !py-2 !px-4 !min-h-0 text-sm">
            <Trophy size={16} /> Skip to finish
          </button>
        </div>
        <div className="progress-3d">
          <div className="bar" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block">
          <div className="glass rounded-3xl p-4 sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto">
            {Object.entries(phasesGrouped).map(([phase, items]) => (
              <div key={phase} className="mb-5 last:mb-0">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <span>{PHASE_META[phase]?.emoji ?? "•"}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {phase}
                  </span>
                </div>
                <ul className="space-y-1">
                  {items.map((s) => {
                    const active = s.step_number === current;
                    const done = s.step_number < current;
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => setCurrent(s.step_number)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 transition-all ${
                            active
                              ? "bg-gradient-accent text-accent-foreground shadow-glow font-semibold"
                              : "hover:bg-foreground/5"
                          }`}
                        >
                          <span
                            className={`h-6 w-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              done ? "bg-secondary text-secondary-foreground" : active ? "bg-foreground/15" : "bg-foreground/10"
                            }`}
                          >
                            {done ? <CheckCircle2 size={14} /> : s.step_number}
                          </span>
                          <span className="line-clamp-2">{s.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Step card */}
        <section>
          {loading ? (
            <CardSkeleton />
          ) : !step ? (
            <div className="glass rounded-3xl p-8 text-center">
              <p>No steps found.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.article
                key={step.id}
                initial={{ opacity: 0, y: 24, rotateX: 6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={onSwipe}
                className="glass-strong rounded-3xl p-6 md:p-10 relative overflow-hidden touch-pan-y"
              >
                <div
                  aria-hidden
                  className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-30 blur-3xl pointer-events-none"
                  style={{ background: "var(--gradient-accent)" }}
                />
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                  <span>{PHASE_META[step.phase]?.emoji}</span>
                  <span>{step.phase}</span>
                  <span>·</span>
                  <span>Step {step.step_number} of {total}</span>
                </div>

                <div className="text-7xl md:text-8xl mb-4 float-y inline-block">
                  {step.emoji ?? "✨"}
                </div>

                <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3">
                  {step.title}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {step.description}
                </p>

                {step.pro_tip && (
                  <div className="pro-tip mt-6 flex items-start gap-3">
                    <Lightbulb className="text-accent shrink-0 mt-0.5" size={20} />
                    <div>
                      <div className="font-bold text-sm mb-1">Pro tip</div>
                      <div className="text-foreground/85">{step.pro_tip}</div>
                    </div>
                  </div>
                )}

                {/* Mobile mini stepper */}
                <div className="mt-7 lg:hidden">
                  <div className="flex flex-wrap gap-1.5">
                    {steps.map((s) => (
                      <button
                        key={s.id}
                        aria-label={`Go to step ${s.step_number}`}
                        onClick={() => setCurrent(s.step_number)}
                        className={`h-2 flex-1 min-w-[10px] rounded-full transition-all ${
                          s.step_number === current
                            ? "bg-gradient-accent"
                            : s.step_number < current
                            ? "bg-secondary"
                            : "bg-foreground/15"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-7 flex items-center justify-between gap-3">
                  <button onClick={goPrev} disabled={current === 1} className="btn-ghost-3d">
                    <ChevronLeft size={18} /> Prev
                  </button>
                  {current < total ? (
                    <button onClick={goNext} className="btn-3d">
                      Next <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button onClick={finish} className="btn-3d pulse-glow">
                      I'm ready <Trophy size={18} />
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs text-muted-foreground text-center lg:hidden">
                  Tip: swipe left or right to navigate
                </p>
              </motion.article>
            </AnimatePresence>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Need a quick answer? <Link to="/faq" className="underline underline-offset-4 font-medium">Browse the FAQ</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
