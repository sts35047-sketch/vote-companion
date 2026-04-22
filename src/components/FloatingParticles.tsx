import { useMemo } from "react";

const EMOJIS = ["🗳️", "✨", "📜", "🏛️", "✅", "📍", "📝", "🎉", "🪪", "📚"];

export function FloatingParticles({ count = 14 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        emoji: EMOJIS[i % EMOJIS.length],
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 18 + Math.random() * 28,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 8,
        opacity: 0.25 + Math.random() * 0.35,
      })),
    [count]
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((p, i) => (
        <span
          key={i}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `floatY ${p.duration}s ease-in-out ${p.delay}s infinite`,
            filter: "blur(0.2px) drop-shadow(0 8px 18px hsl(0 0% 0% / 0.25))",
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
