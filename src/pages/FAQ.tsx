import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { CardSkeleton } from "@/components/Skeleton";
import { toast } from "sonner";
import { T } from "@/i18n/T";
import { useT } from "@/i18n/I18nProvider";

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  helpful_count: number;
}

const VOTED_KEY = "first-vote-faq-votes";

function getVotes(): Record<number, "up" | "down"> {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) || "{}");
  } catch {
    return {};
  }
}
function setVote(id: number, v: "up" | "down") {
  const all = getVotes();
  all[id] = v;
  localStorage.setItem(VOTED_KEY, JSON.stringify(all));
}

export default function FAQ() {
  useSEO({
    title: "FAQ — Questions you were too embarrassed to ask",
    description: "Honest answers to the questions every first-time voter wonders about. No jargon, no judgment.",
  });

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [votes, setVotes] = useState<Record<number, "up" | "down">>({});

  useEffect(() => {
    setVotes(getVotes());
    (async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("id");
      if (error) {
        toast.error("Couldn't load FAQs.");
        setLoading(false);
        return;
      }
      setFaqs((data ?? []) as Faq[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [faqs, query]);

  const handleVote = async (faq: Faq, kind: "up" | "down") => {
    if (votes[faq.id]) {
      toast("You already voted on this one — thank you! 💛");
      return;
    }
    setVote(faq.id, kind);
    setVotes((v) => ({ ...v, [faq.id]: kind }));

    if (kind === "up") {
      const newCount = faq.helpful_count + 1;
      setFaqs((arr) => arr.map((f) => (f.id === faq.id ? { ...f, helpful_count: newCount } : f)));
      await supabase.from("faqs").update({ helpful_count: newCount }).eq("id", faq.id);
    }
    toast.success(kind === "up" ? "Glad it helped!" : "Thanks — we'll keep improving.");
  };

  return (
    <T>
    <div className="container pt-6 md:pt-10">
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-8"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          Questions You Were Too <br className="hidden sm:block" />
          <span className="gradient-text">Embarrassed To Ask</span> 😅
        </h1>
        <p className="mt-3 text-muted-foreground md:text-lg">
          Real questions. Real answers. Zero side-eye.
        </p>
      </motion.header>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="glass rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a question…"
            className="bg-transparent outline-none flex-1 text-sm md:text-base placeholder:text-muted-foreground min-w-0"
          />
        </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center text-muted-foreground">
            No questions match "{query}". Try another keyword.
          </div>
        ) : (
          filtered.map((faq, i) => {
            const open = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.45 }}
                className="glass rounded-3xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(open ? null : faq.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 text-left min-h-[56px]"
                  aria-expanded={open}
                >
                  <span className="font-semibold text-base md:text-lg pr-2">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-9 w-9 rounded-xl glass flex items-center justify-center shrink-0"
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground">
                            {faq.helpful_count} {faq.helpful_count === 1 ? "person" : "people"} found this helpful
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground mr-1">Was this helpful?</span>
                            <button
                              onClick={() => handleVote(faq, "up")}
                              aria-label="Helpful"
                              className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
                                votes[faq.id] === "up"
                                  ? "bg-gradient-accent text-accent-foreground border-transparent shadow-glow"
                                  : "glass hover:scale-105"
                              }`}
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button
                              onClick={() => handleVote(faq, "down")}
                              aria-label="Not helpful"
                              className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
                                votes[faq.id] === "down"
                                  ? "bg-foreground/15 border-transparent"
                                  : "glass hover:scale-105"
                              }`}
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
    </T>
  );
}
