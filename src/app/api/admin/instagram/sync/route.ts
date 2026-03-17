import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/instagram/sync
 * Sync published posts from Instagram Graph API
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
      { error: "Instagram nao conectado. Conecte sua conta primeiro." },
      { status: 400 }
    );
  }

  const { access_token, ig_user_id } = tokenRow;
  const errors: string[] = [];
  let synced = 0;

  try {
    // Fetch recent media
    const mediaRes = await fetch(
      `https://graph.instagram.com/${ig_user_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${access_token}`
    );
    const mediaData = await mediaRes.json();

    if (mediaData.error) {
      return NextResponse.json({ error: mediaData.error.message }, { status: 400 });
    }

    const posts = mediaData.data || [];

    for (const post of posts) {
      // Map IG media_type to our post_type
      let postType = "single_image";
      if (post.media_type === "VIDEO") postType = "reels";
      else if (post.media_type === "CAROUSEL_ALBUM") postType = "carousel";

      // Try to get insights for this post
      let impressions = 0;
      let reach = 0;
      let saves = 0;
      let shares = 0;

      try {
        const insightRes = await fetch(
          `https://graph.instagram.com/${post.id}/insights?metric=impressions,reach,saved,shares&access_token=${access_token}`
        );
        const insightData = await insightRes.json();

        if (insightData.data) {
          for (const metric of insightData.data) {
            if (metric.name === "impressions") impressions = metric.values?.[0]?.value || 0;
            if (metric.name === "reach") reach = metric.values?.[0]?.value || 0;
            if (metric.name === "saved") saves = metric.values?.[0]?.value || 0;
            if (metric.name === "shares") shares = metric.values?.[0]?.value || 0;
          }
        }
      } catch {
        errors.push(`Insights failed for post ${post.id}`);
      }

      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      const totalEngagement = likes + comments + saves + shares;
      const engagementRate = reach > 0 ? Number(((totalEngagement / reach) * 100).toFixed(2)) : 0;

      // Upsert into instagram_posts
      const { error: upsertError } = await supabaseAdmin
        .from("instagram_posts")
        .upsert(
          {
            ig_media_id: post.id,
            caption: post.caption || null,
            post_type: postType,
            status: "published",
            platform: "instagram",
            published_at: post.timestamp,
            ig_permalink: post.permalink || null,
            ig_thumbnail_url: post.thumbnail_url || post.media_url || null,
            impressions,
            reach,
            likes,
            comments,
            saves,
            shares,
            engagement_rate: engagementRate,
          },
          { onConflict: "ig_media_id" }
        );

      if (upsertError) {
        errors.push(`Upsert failed for ${post.id}: ${upsertError.message}`);
      } else {
        synced++;
      }
    }

    return NextResponse.json({ synced, errors, total: posts.length });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Erro ao sincronizar" }, { status: 500 });
  }
}
