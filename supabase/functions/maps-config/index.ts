// ════════════════════════════════════════════════════
// FREE API SETUP — GOOGLE MAPS PLATFORM
// ════════════════════════════════════════════════════
// 1. WHERE TO GET KEY: https://console.cloud.google.com
// 2. HOW TO ENABLE: APIs & Services → Enable
//    "Maps JavaScript API" + "Places API"
// 3. FREE TIER LIMIT: $200 / month credit (~28k loads)
// 4. SECRET NAME: GOOGLE_MAPS_API_KEY
// 5. RESTRICT KEY to your domain in console!
// ════════════════════════════════════════════════════
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") ?? "";
  return new Response(JSON.stringify({ apiKey }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
