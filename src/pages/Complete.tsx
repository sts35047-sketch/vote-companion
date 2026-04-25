import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import { Download, Share2, Home, BadgeCheck, Trophy } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { getElapsedMinutes, isCompleted, markCompleted } from "@/lib/session";
import { toast } from "sonner";
import { T } from "@/i18n/T";

export default function Complete() {
  useSEO({
    title: "You're Ready To Vote! 🎉 — FirstVote",
    description: "Celebrate completing the FirstVote walkthrough. Share your achievement and head to the polls with confidence.",
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (!isCompleted()) markCompleted();
    setMinutes(getElapsedMinutes());

    const fire = (x: number) => {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 45,
        origin: { x, y: 0.7 },
        colors: ["#1B4DFF", "#0b46f9", "#FF6B35", "#ffb59d", "#dde1fa"],
        scalar: 1.05,
      });
    };
    fire(0.2);
    setTimeout(() => fire(0.8), 250);
    setTimeout(() => fire(0.5), 500);

    const i = setInterval(() => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: ["#1B4DFF", "#FF6B35", "#dde1fa"],
      });
    }, 1800);
    const stop = setTimeout(() => clearInterval(i), 6000);

    return () => {
      clearInterval(i);
      clearTimeout(stop);
    };
  }, []);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const url = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "firstvote-ready.png";
      link.href = url;
      link.click();
      toast.success("Saved your achievement card!");
    } catch {
      toast.error("Couldn't generate image. Try again.");
    }
  };

  const shareText = "I'm ready for my first vote 🗳️ — walked through every step on FirstVote.";
  const url = typeof window !== "undefined" ? window.location.origin : "";

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "FirstVote", text: shareText, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      toast.success("Link copied!");
    }
  };

  return (
    <T>
      <div className="container max-w-2xl pt-10 md:pt-16 pb-12">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="flex justify-center mb-8"
        >
          <div className="relative h-[180px] w-[180px] md:h-[220px] md:w-[220px]">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 flex items-center justify-center shadow-[0_0_60px_-10px_hsl(45_100%_60%/0.5)] border border-white/20 float-y">
              <Trophy size={88} className="text-amber-900 drop-shadow" />
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display text-4xl md:text-6xl font-bold text-center leading-[1.05] mb-10 text-balance"
        >
          You're Ready To Vote! <span className="inline-block">🎉</span>
        </motion.h1>

        {/* Shareable verified card with gradient border */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          ref={cardRef}
          className="relative rounded-[2rem] p-[1px] mb-10 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(227 100% 60%), hsl(232 95% 30%))",
            boxShadow: "0 20px 60px -10px hsl(227 100% 50% / 0.45)",
          }}
        >
          <div className="rounded-[calc(2rem-1px)] p-7 md:p-8 bg-[hsl(224_35%_12%/0.65)] backdrop-blur-2xl border-t border-l border-white/15">
            {/* Verified row */}
            <div className="flex items-center gap-4 mb-7">
              <div className="icon-chip h-12 w-12 shrink-0">
                <BadgeCheck size={22} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-lg md:text-xl font-semibold text-white">
                  Voter Status: Verified
                </h3>
                <p className="text-sm text-[hsl(226_78%_88%/0.75)]">
                  Secure Civic Identity Linked
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 bg-white/5 border border-white/10">
                <div className="label-caps text-[hsl(226_78%_88%/0.6)] mb-2">Steps</div>
                <div className="font-display text-xl font-semibold text-white">
                  13 Completed
                </div>
              </div>
              <div className="rounded-xl p-4 bg-white/5 border border-white/10">
                <div className="label-caps text-[hsl(226_78%_88%/0.6)] mb-2">Time</div>
                <div className="font-display text-xl font-semibold text-white">
                  {minutes} min
                </div>
              </div>
            </div>

            {/* Footer chip */}
            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold bg-white/10 border border-white/15 text-white/80">
                firstvote.app
              </span>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button onClick={shareNative} className="btn-orange flex-1 ripple-host">
            <Share2 size={18} /> Share with a friend
          </button>
          <button onClick={downloadCard} className="btn-ghost-3d flex-1 ripple-host">
            <Download size={18} /> Download card
          </button>
        </div>

        <Link to="/" className="btn-ghost-3d w-full ripple-host">
          <Home size={18} /> Back to Home
        </Link>
      </div>
    </T>
  );
}
