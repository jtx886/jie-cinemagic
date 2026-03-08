import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VOD_APIS = [
  "https://api.ffzyapi.com/api.php/provide/vod/",
  "https://api.1080p.one/api.php/provide/vod/",
  "https://api.xinlangapi.com/xinlangapi.php/provide/vod/",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { keyword } = await req.json();
    if (!keyword || typeof keyword !== "string") {
      return new Response(JSON.stringify({ error: "missing keyword" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeKw = encodeURIComponent(keyword.trim().slice(0, 80));
    const allResults: any[] = [];

    // Query all APIs in parallel
    const promises = VOD_APIS.map(async (api) => {
      try {
        const url = `${api}?ac=detail&wd=${safeKw}`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data?.list || [];
      } catch {
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    for (const r of results) {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        allResults.push(...r.value);
      }
    }

    // Deduplicate by vod_name
    const seen = new Set<string>();
    const deduped = allResults.filter((item) => {
      const key = item.vod_name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return new Response(JSON.stringify({ code: 1, list: deduped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
