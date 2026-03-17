import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/instagram/insights
 * Return cached daily insights from DB
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabaseAdmin
    .from("instagram_insights_daily")
    .select("*")
    .gte("date", since.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ insights: data });
}

/**
 * POST /api/admin/instagram/insights
 * Fetch and cache insights from Instagram Graph API
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  // Get token
  const { data: tokenRow } = await supabaseAdmin
    .from("instagram_token_store")
    .select("access_token, ig_user_id")
    .eq("id", 1)
    .single();

  if (!tokenRow) {
    return NextResponse.json(
      { error: "Instagram nao conectado." },
      { status: 400 }
    );
  }

  const { access_token, ig_user_id } = tokenRow;

  try {
    // Get current follower count
    const profileRes = await fetch(
      `https://graph.instagram.com/${ig_user_id}?fields=followers_count,follows_count,media_count&access_token=${access_token}`
    );
    const profileData = await profileRes.json();

    if (profileData.error) {
      return NextResponse.json({ error: profileData.error.message }, { status: 400 });
    }

    // Get daily insights for the last 30 days
    const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const until = Math.floor(Date.now() / 1000);

    const insightsRes = await fetch(
      `https://graph.instagram.com/${ig_user_id}/insights?metric=impressions,reach,profile_views,follower_count,website_clicks&period=day&since=${since}&until=${until}&access_token=${access_token}`
    );
    const insightsData = await insightsRes.json();

    if (insightsData.error) {
      // Some metrics may not be available — try with fewer metrics
      console.error("Insights API error:", insightsData.error);
      return NextResponse.json({ error: insightsData.error.message }, { status: 400 });
    }

    // Parse and upsert daily data
    const dailyMap: Record<string, Record<string, number>> = {};

    if (insightsData.data) {
      for (const metric of insightsData.data) {
        for (const val of metric.values || []) {
          const date = val.end_time?.split("T")[0];
          if (!date) continue;
          if (!dailyMap[date]) dailyMap[date] = {};
          dailyMap[date][metric.name] = val.value || 0;
        }
      }
    }

    let upserted = 0;
    for (const [date, metrics] of Object.entries(dailyMap)) {
      const { error: upsertError } = await supabaseAdmin
        .from("instagram_insights_daily")
        .upsert(
          {
            date,
            impressions: metrics.impressions || 0,
            reach: metrics.reach || 0,
            profile_views: metrics.profile_views || 0,
            follower_count: metrics.follower_count || profileData.followers_count || 0,
            website_clicks: metrics.website_clicks || 0,
          },
          { onConflict: "date" }
        );

      if (!upsertError) upserted++;
    }

    return NextResponse.json({
      success: true,
      upserted,
      currentFollowers: profileData.followers_count,
      currentFollowing: profileData.follows_count,
      totalMedia: profileData.media_count,
    });
  } catch (err) {
    console.error("Insights sync error:", err);
    return NextResponse.json({ error: "Erro ao sincronizar insights" }, { status: 500 });
  }
}
