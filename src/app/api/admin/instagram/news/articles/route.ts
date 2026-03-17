import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";
import Parser from "rss-parser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rssParser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "PAM-NewsBot/1.0" },
});

/**
 * GET /api/admin/instagram/news/articles
 * List cached articles with optional topic filter
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  let query = supabaseAdmin
    .from("news_articles")
    .select("*, news_feeds!inner(name, topic)")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (topic && topic !== "all") {
    query = query.eq("topic", topic);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data });
}

/**
 * POST /api/admin/instagram/news/articles
 * Fetch all active RSS feeds and cache new articles
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  // Get active feeds
  const { data: feeds, error: feedsError } = await supabaseAdmin
    .from("news_feeds")
    .select("*")
    .eq("is_active", true);

  if (feedsError || !feeds) {
    return NextResponse.json({ error: "Erro ao buscar feeds" }, { status: 500 });
  }

  let totalNew = 0;
  const errors: string[] = [];

  for (const feed of feeds) {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      const items = parsed.items || [];

      for (const item of items.slice(0, 20)) {
        if (!item.link || !item.title) continue;

        const summary = (item.contentSnippet || item.content || "")
          .replace(/<[^>]*>/g, "")
          .slice(0, 300);

        const { error: insertError } = await supabaseAdmin
          .from("news_articles")
          .upsert(
            {
              feed_id: feed.id,
              title: item.title,
              url: item.link,
              source_name: feed.name,
              summary: summary || null,
              published_at: item.isoDate || item.pubDate || new Date().toISOString(),
              topic: feed.topic || "general",
            },
            { onConflict: "url" }
          );

        if (!insertError) totalNew++;
      }

      // Update last_fetched_at
      await supabaseAdmin
        .from("news_feeds")
        .update({ last_fetched_at: new Date().toISOString() })
        .eq("id", feed.id);
    } catch (err) {
      errors.push(`Feed "${feed.name}" falhou: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  }

  return NextResponse.json({ fetched: totalNew, errors, feedsProcessed: feeds.length });
}
