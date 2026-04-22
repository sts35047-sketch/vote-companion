import { ReactNode, useEffect, useRef } from "react";
import { useT } from "@/i18n/I18nProvider";

/**
 * Translates the text content of its children when language changes.
 * Walks text nodes and swaps them. Falls back gracefully.
 *
 * Use for static UI copy. For dynamic data from DB, call `t()` manually.
 */
export function T({ children }: { children: ReactNode }) {
  const { t, lang } = useT();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    // Collect text nodes
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let n: Node | null = walker.nextNode();
    while (n) {
      const text = (n as Text).data.trim();
      if (text) nodes.push(n as Text);
      n = walker.nextNode();
    }
    // Store originals once
    nodes.forEach((node) => {
      const anyNode = node as Text & { __orig?: string };
      if (anyNode.__orig === undefined) anyNode.__orig = node.data;
      const original = anyNode.__orig!;
      const trimmed = original.trim();
      if (!trimmed) return;
      const translated = t(trimmed);
      if (translated !== trimmed) {
        node.data = original.replace(trimmed, translated);
      } else {
        node.data = original;
      }
    });
    // Re-run when async translations arrive (the t() function triggers a render)
  });

  return <span ref={ref}>{children}</span>;
  void lang;
}
