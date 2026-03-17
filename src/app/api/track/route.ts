import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/track
 * Records anonymous page views for analytics.
 * Called from a client-side tracking script.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      page_path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      visitor_id,
      session_id,
      influencer_slug,
    } = body;

    if (!page_path || typeof page_path !== "string") {
      return NextResponse.json(
        { error: "page_path is required" },
        { status: 400 }
      );
    }

    // Sanitize inputs — limit string lengths to prevent data poisoning
    const sanitize = (val: unknown, maxLen = 500): string | null => {
      if (typeof val !== "string" || !val) return null;
      return val.slice(0, maxLen);
    };

    const safePath = sanitize(page_path, 500)!;
    const safeReferrer = sanitize(referrer, 2000);
    const safeUtmSource = sanitize(utm_source, 100);
    const safeUtmMedium = sanitize(utm_medium, 100);
    const safeUtmCampaign = sanitize(utm_campaign, 200);
    const safeVisitorId = sanitize(visitor_id, 100);
    const safeSessionId = sanitize(session_id, 100);
    const safeInfluencerSlug = sanitize(influencer_slug, 100);

    // Validate influencer slug format (alphanumeric + hyphens only)
    const cleanSlug = safeInfluencerSlug && /^[a-zA-Z0-9_-]+$/.test(safeInfluencerSlug)
      ? safeInfluencerSlug
      : null;

    // Detect device type from user agent
    const userAgent = req.headers.get("user-agent") || "";
    let deviceType = "desktop";
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      deviceType = /ipad|tablet/i.test(userAgent) ? "tablet" : "mobile";
    }

    // Hash IP for privacy
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

    // Look up influencer if slug provided
    let influencerId: string | null = null;
    if (cleanSlug) {
      const { data: influencer } = await supabaseAdmin
        .from("influencers")
        .select("id")
        .eq("slug", cleanSlug)
        .eq("status", "ativo")
        .single();
      if (influencer) influencerId = influencer.id;
    }

    await supabaseAdmin.from("page_views").insert({
      visitor_id: safeVisitorId,
      page_path: safePath,
      referrer: safeReferrer,
      utm_source: safeUtmSource,
      utm_medium: safeUtmMedium,
      utm_campaign: safeUtmCampaign,
      device_type: deviceType,
      user_agent: userAgent.slice(0, 500),
      ip_hash: ipHash,
      session_id: safeSessionId,
      influencer_id: influencerId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ ok: true }); // Don't fail the page
  }
}
