// ════════════════════════════════════════════════════
// FREE API SETUP — GNEWS.IO
// ════════════════════════════════════════════════════
// 1. WHERE TO GET KEY: https://gnews.io/register
// 2. HOW TO ENABLE: Sign up → copy API key
// 3. FREE TIER LIMIT: 100 requests / day
// 4. SECRET NAME: GNEWS_API_KEY
// ════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CACHE_MINUTES = 30;

const QUERIES: Record<string, { q: string; lang?: string; country?: string }> = {
  all: { q: "election OR voting OR \"polling station\"", lang: "en" },
  local: { q: "election India voting", lang: "en", country: "in" },
  international: { q: "election democracy global", lang: "en" },
  factcheck: { q: "election fact check misinformation", lang: "en" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const category = (url.searchParams.get("category") ?? "all").toLowerCase();
    const cfg = QUERIES[category] ?? QUERIES.all;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Serve cache if fresh
    const since = new Date(Date.now() - CACHE_MINUTES * 60_000).toISOString();
    const { data: fresh } = await supabase
      .from("news_cache")
      .select("*")
      .eq("category", category)
      .gte("fetched_at", since)
      .order("published_at", { ascending: false })
      .limit(20);

    if (fresh && fresh.length > 0) {
      return json({ articles: fresh, cached: true });
    }

    const apiKey = Deno.env.get("GNEWS_API_KEY");
    if (!apiKey) {
      // No key → return whatever stale cache we have
      const { data: stale } = await supabase
        .from("news_cache")
        .select("*")
        .eq("category", category)
        .order("published_at", { ascending: false })
        .limit(20);
      return json({ articles: stale ?? [], cached: true, stale: true });
    }

    const params = new URLSearchParams({
      q: cfg.q,
      lang: cfg.lang ?? "en",
      max: "20",
      sortby: "publishedAt",
      apikey: apiKey,
    });
    if (cfg.country) params.set("country", cfg.country);

    const resp = await fetch(`https://gnews.io/api/v4/search?${params}`);
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("GNews error:", resp.status, errText);
      // Fall back to stale cache
      const { data: stale } = await supabase
        .from("news_cache")
        .select("*")
        .eq("category", category)
        .order("published_at", { ascending: false })
        .limit(20);
      return json({ articles: stale ?? [], stale: true, error: `GNews ${resp.status}` });
    }
    const data = await resp.json();
    const articles = (data?.articles ?? []) as Array<{
      title: string;
      description: string;
      url: string;
      image: string;
      publishedAt: string;
      source: { name: string };
    }>;

    const rows = articles.map((a) => ({
      headline: a.title,
      description: a.description,
      source: a.source?.name ?? "Unknown",
      url: a.url,
      image_url: a.image,
      category,
      published_at: a.publishedAt,
      fetched_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      // Upsert by URL (unique)
      const { error } = await supabase
        .from("news_cache")
        .upsert(rows, { onConflict: "url" });
      if (error) console.error("News cache write failed:", error);
    }

    return json({ articles: rows, cached: false });
  } catch (e) {
    console.error("news fn error:", e);
    return json({ error: (e as Error).message, articles: [] }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
