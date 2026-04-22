// ════════════════════════════════════════════════════
// FREE API SETUP — GOOGLE CLOUD TRANSLATION
// ════════════════════════════════════════════════════
// 1. WHERE TO GET KEY: https://console.cloud.google.com
// 2. HOW TO ENABLE: APIs & Services → Enable
//    "Cloud Translation API"
// 3. FREE TIER LIMIT: 500,000 characters / month
// 4. SECRET NAME: GOOGLE_TRANSLATE_API_KEY
// ════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  texts: string[];
  target: string; // ISO code
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { texts, target } = (await req.json()) as ReqBody;
    if (!Array.isArray(texts) || !target || typeof target !== "string") {
      return json({ error: "texts[] and target required" }, 400);
    }
    if (texts.length === 0) return json({ translations: [] });
    if (texts.length > 200) return json({ error: "Too many strings" }, 400);
    if (target === "en") {
      // No translation needed
      return json({ translations: texts });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Try cache first
    const { data: cached } = await supabase
      .from("translations_cache")
      .select("original, translated")
      .eq("language", target)
      .in("original", texts);

    const cacheMap = new Map<string, string>(
      (cached ?? []).map((r) => [r.original, r.translated]),
    );
    const missing = [...new Set(texts.filter((t) => !cacheMap.has(t) && t.trim()))];

    // 2. Call Google for missing
    if (missing.length > 0) {
      const apiKey = Deno.env.get("GOOGLE_TRANSLATE_API_KEY");
      if (!apiKey) {
        // No key — fall back to original texts (graceful)
        console.warn("GOOGLE_TRANSLATE_API_KEY missing — returning originals");
      } else {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: missing,
            target,
            format: "text",
            source: "en",
          }),
        });
        if (!resp.ok) {
          const err = await resp.text();
          console.error("Translate API error:", resp.status, err);
        } else {
          const data = await resp.json();
          const translated: string[] =
            data?.data?.translations?.map((t: { translatedText: string }) => t.translatedText) ??
            [];
          missing.forEach((orig, i) => {
            if (translated[i]) cacheMap.set(orig, translated[i]);
          });
          // Store in cache (fire and forget)
          const rows = missing
            .filter((o) => cacheMap.has(o))
            .map((original) => ({
              original,
              translated: cacheMap.get(original)!,
              language: target,
            }));
          if (rows.length) {
            supabase
              .from("translations_cache")
              .upsert(rows, { onConflict: "original,language" })
              .then(({ error }) => {
                if (error) console.error("Cache write failed:", error);
              });
          }
        }
      }
    }

    const translations = texts.map((t) => cacheMap.get(t) ?? t);
    return json({ translations });
  } catch (e) {
    console.error("translate fn error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
