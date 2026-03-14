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

    if (!page_path) {
      return NextResponse.json(
        { error: "page_path is required" },
        { status: 400 }
      );
    }

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
    if (influencer_slug) {
      const { data: influencer } = await supabaseAdmin
        .from("influencers")
        .select("id")
        .eq("slug", influencer_slug)
        .eq("status", "ativo")
        .single();
      if (influencer) influencerId = influencer.id;
    }

    await supabaseAdmin.from("page_views").insert({
      visitor_id: visitor_id || null,
      page_path,
      referrer: referrer || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      device_type: deviceType,
      user_agent: userAgent.slice(0, 500),
      ip_hash: ipHash,
      session_id: session_id || null,
      influencer_id: influencerId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ ok: true }); // Don't fail the page
  }
}
