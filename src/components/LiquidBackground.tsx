import { useEffect, useRef } from "react";

/**
 * Lightweight CSS/SVG liquid background.
 * - 4 large blurred blobs morphing & drifting
 * - SVG goo filter for that "lava lamp" merge effect
 * - Mouse parallax on desktop, gyroscope on mobile
 * - Pauses when tab hidden (battery)
 * - Zero deps, ~3kb, GPU accelerated (transform/filter only)
 */
export function LiquidBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let visible = true;

    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      tx = (e.clientX / w - 0.5) * 30;
      ty = (e.clientY / h - 0.5) * 30;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-30, Math.min(30, e.gamma / 2));
      ty = Math.max(-30, Math.min(30, (e.beta - 45) / 3));
    };
    const onVis = () => {
      visible = document.visibilityState === "visible";
      el.style.animationPlayState = visible ? "running" : "paused";
      el.querySelectorAll<HTMLElement>(".liquid-blob").forEach((b) => {
        b.style.animationPlayState = visible ? "running" : "paused";
      });
    };

    const tick = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      el.style.setProperty("--px", `${cx}px`);
      el.style.setProperty("--py", `${cy}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none liquid-bg"
    >
      {/* Goo filter for blob merging */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Base wash */}
      <div className="absolute inset-0 liquid-base" />

      {/* Goo container with morphing blobs */}
      <div className="absolute inset-0 liquid-goo-wrap">
        <div className="liquid-blob liquid-blob-1" />
        <div className="liquid-blob liquid-blob-2" />
        <div className="liquid-blob liquid-blob-3" />
        <div className="liquid-blob liquid-blob-4" />
      </div>

      {/* Subtle grain overlay */}
      <div className="absolute inset-0 liquid-grain opacity-[0.06] mix-blend-overlay" />
    </div>
  );
}
