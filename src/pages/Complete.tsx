import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import { Download, Share2, MessageCircle, Twitter, RefreshCw, Trophy } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { getElapsedMinutes, isCompleted, markCompleted } from "@/lib/session";
import { toast } from "sonner";

export default function Complete() {
  useSEO({
    title: "You're Ready To Vote! 🎉 — First Vote",
    description: "Celebrate completing the First Vote walkthrough. Share your achievement and head to the polls with confidence.",
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (!isCompleted()) markCompleted();
    setMinutes(getElapsedMinutes());

    // Confetti cannons
    const fire = (x: number) => {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 45,
        origin: { x, y: 0.7 },
        colors: ["#FF6B35", "#F7931E", "#1B3A6B", "#2D6A4F", "#ffffff"],
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
        colors: ["#FF6B35", "#F7931E", "#1B3A6B", "#2D6A4F"],
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
      link.download = "first-vote-ready.png";
      link.href = url;
      link.click();
      toast.success("Saved your achievement card!");
    } catch {
      toast.error("Couldn't generate image. Try again.");
    }
  };

  const shareText = "I'm ready for my First Vote! 🗳️ Walk through it judgment-free at";
  const url = typeof window !== "undefined" ? window.location.origin : "";

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`, "_blank");
  };
  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "First Vote", text: shareText, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      toast.success("Link copied!");
    }
  };

  return (
    <div className="container pt-6 md:pt-10 pb-12">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
          className="mx-auto mb-6 inline-flex"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-accent blur-2xl opacity-60 rounded-full" />
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow float-y">
              <Trophy className="text-accent-foreground drop-shadow" size={64} />
            </div>
          </div>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          You're Ready To <span className="gradient-text">Vote!</span> 🎉
        </h1>
        <p className="mt-4 text-muted-foreground md:text-lg">
          You walked through every step. Take a breath — you've got this.
        </p>
      </motion.section>

      {/* Stats */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {[
          { k: "13", v: "Steps completed" },
          { k: `${minutes}`, v: minutes === 1 ? "Minute well spent" : "Minutes well spent" },
          { k: "100%", v: "Ready" },
        ].map((s) => (
          <div key={s.v} className="glass rounded-3xl p-5 text-center">
            <div className="text-4xl font-extrabold gradient-text mb-1">{s.k}</div>
            <div className="text-xs text-muted-foreground font-medium">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Shareable card */}
      <div className="mt-10 max-w-md mx-auto">
        <div
          ref={cardRef}
          className="rounded-3xl p-8 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(215 58% 26%), hsl(153 41% 30%))",
            color: "white",
            boxShadow: "0 30px 80px -20px hsl(215 58% 20% / 0.6)",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-50 blur-2xl"
            style={{ background: "linear-gradient(135deg, #FF6B35, #F7931E)" }}
          />
          <div className="relative">
            <div className="text-6xl mb-3">🗳️</div>
            <div className="text-xs uppercase tracking-[0.2em] opacity-80 mb-2">First Vote · Achievement</div>
            <h2 className="text-2xl font-extrabold leading-tight">
              I'm ready for my <br /> <span style={{
                background: "linear-gradient(135deg, #FF6B35, #F7931E)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}>First Vote!</span>
            </h2>
            <p className="mt-3 text-sm opacity-85">Completed all 13 steps · {minutes} min</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
                 style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
              firstvote.app
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={downloadCard} className="btn-3d">
            <Download size={16} /> Download
          </button>
          <button onClick={shareNative} className="btn-ghost-3d">
            <Share2 size={16} /> Share
          </button>
          <button onClick={shareWhatsApp} className="btn-ghost-3d">
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={shareTwitter} className="btn-ghost-3d">
            <Twitter size={16} /> Twitter
          </button>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/journey" className="btn-ghost-3d w-full sm:w-auto">
            <RefreshCw size={16} /> Revisit a step
          </Link>
          <Link to="/faq" className="btn-ghost-3d w-full sm:w-auto">
            Browse FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
