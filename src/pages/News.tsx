import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { useT } from "@/i18n/I18nProvider";

export interface Article {
  id?: number;
  headline: string;
  description?: string | null;
  source: string;
  url: string;
  image_url?: string | null;
  published_at: string;
}

const CATS = [
  { key: "all", label: "All" },
  { key: "local", label: "Local" },
  { key: "international", label: "International" },
  { key: "factcheck", label: "Fact Check" },
];

const OFFLINE_CACHE_KEY = (cat: string) => `news_cache_${cat}`;

async function loadFromSupabaseCache(category: string): Promise<Article[]> {
  let query = supabase
    .from("news_cache")
    .select("id, headline, description, source, url, image_url, published_at")
    .order("published_at", { ascending: false })
    .limit(20);
  if (category !== "all") query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? [])
    .filter((r) => r.headline && r.url && r.source && r.published_at)
    .map((r) => ({
      id: r.id,
      headline: r.headline as string,
      description: r.description,
      source: r.source as string,
      url: r.url as string,
      image_url: r.image_url,
      published_at: r.published_at as string,
    }));
}

export function useNews(category = "all") {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const url = `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/news?category=${category}`;
      const resp = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const fetched: Article[] = data?.articles ?? [];
      setArticles(fetched);
      setOffline(false);
      try {
        localStorage.setItem(
          OFFLINE_CACHE_KEY(category),
          JSON.stringify({ at: Date.now(), articles: fetched }),
        );
      } catch {
        /* quota — ignore */
      }
    } catch (e) {
      console.warn("News edge fetch failed, falling back to cache:", e);
      // 1) Try Supabase news_cache table directly
      try {
        const cached = await loadFromSupabaseCache(category);
        if (cached.length > 0) {
          setArticles(cached);
          setOffline(true);
          return;
        }
      } catch (dbErr) {
        console.warn("Supabase cache fallback failed:", dbErr);
      }
      // 2) Last-resort: localStorage snapshot from a previous successful load
      try {
        const raw = localStorage.getItem(OFFLINE_CACHE_KEY(category));
        if (raw) {
          const parsed = JSON.parse(raw) as { articles: Article[] };
          if (parsed?.articles?.length) {
            setArticles(parsed.articles);
            setOffline(true);
            return;
          }
        }
      } catch {
        /* ignore */
      }
      setOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    const id = window.setInterval(load, 30 * 60 * 1000); // 30 min
    const onOnline = () => load();
    window.addEventListener("online", onOnline);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("online", onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return { articles, loading, refreshing, offline, reload: load };
}

function timeAgo(iso: string) {
  const sec = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function NewsCard({ a, t }: { a: Article; t: (s: string) => string }) {
  const [imgFail, setImgFail] = useState(false);
  return (
    <motion.a
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass rounded-3xl overflow-hidden block group min-w-[280px] sm:min-w-0"
    >
      <div className="aspect-[16/9] bg-muted relative overflow-hidden">
        {a.image_url && !imgFail ? (
          <img
            src={a.image_url}
            alt=""
            loading="lazy"
            onError={() => setImgFail(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-primary text-primary-foreground">
            <Newspaper size={36} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-2">
          <span className="font-semibold truncate">{a.source}</span>
          <span>{timeAgo(a.published_at)}</span>
        </div>
        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-2">
          {t(a.headline)}
        </h3>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
          {t("Read more")} <ExternalLink size={12} />
        </span>
      </div>
    </motion.a>
  );
}

export function NewsSkeleton() {
  return (
    <div className="glass rounded-3xl overflow-hidden min-w-[280px] sm:min-w-0">
      <div className="aspect-[16/9] shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 shimmer rounded" />
        <div className="h-4 w-full shimmer rounded" />
        <div className="h-4 w-3/4 shimmer rounded" />
      </div>
    </div>
  );
}

export default function News() {
  const { t } = useT();
  useSEO({
    title: "Latest Election News — First Vote",
    description: "Live updates on elections, polls and voting from across the world.",
  });
  const [category, setCategory] = useState("all");
  const { articles, loading, refreshing, reload } = useNews(category);

  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
            {t("Election")} <span className="gradient-text">{t("News")}</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("Live headlines refreshed every 30 minutes.")}
          </p>
        </div>
        <button
          onClick={reload}
          aria-label="Refresh"
          className="btn-ghost-3d !min-h-[44px] !py-2"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {t("Refresh")}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              category === c.key
                ? "bg-gradient-accent text-accent-foreground shadow-glow"
                : "glass hover:bg-foreground/10"
            }`}
          >
            {t(c.label)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsSkeleton key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <Newspaper className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="font-semibold mb-1">{t("No news right now")}</p>
          <p className="text-sm text-muted-foreground">
            {t("Try a different category or check back soon.")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <NewsCard key={a.url ?? i} a={a} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
