import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function toAbsoluteUrl(input: string, base: string) {
  try {
    return new URL(input, base).toString();
  } catch {
    return input;
  }
}

function toProxyUrl(rawUrl: string, reqOrigin: string) {
  const encoded = encodeURIComponent(rawUrl);
  return `${reqOrigin}/vod-stream?url=${encoded}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const target = url.searchParams.get("url");

    if (!target || !/^https?:\/\//i.test(target)) {
      return new Response(JSON.stringify({ error: "invalid url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: new URL(target).origin,
      },
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "upstream fetch failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = upstream.headers.get("content-type") || "";
    const looksLikeM3u8 = contentType.includes("mpegurl") || target.includes(".m3u8");

    if (looksLikeM3u8) {
      const text = await upstream.text();
      const reqOrigin = new URL(req.url).origin;

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;
          const abs = toAbsoluteUrl(trimmed, target);
          return toProxyUrl(abs, reqOrigin);
        })
        .join("\n");

      return new Response(rewritten, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "public, max-age=60",
        },
      });
    }

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
