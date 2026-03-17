import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FB_APP_ID = process.env.INSTAGRAM_FB_APP_ID || "";
const FB_APP_SECRET = process.env.INSTAGRAM_FB_APP_SECRET || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://patasamorememorias.com.br";

/**
 * GET /api/admin/instagram/token
 * Check if token exists and its status
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { data } = await supabaseAdmin
    .from("instagram_token_store")
    .select("ig_username, ig_user_id, token_expires_at, last_refreshed_at")
    .eq("id", 1)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ connected: false });
  }

  const expiresAt = new Date(data.token_expires_at);
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return NextResponse.json({
    connected: true,
    username: data.ig_username,
    userId: data.ig_user_id,
    expiresAt: data.token_expires_at,
    daysUntilExpiry,
    lastRefreshed: data.last_refreshed_at,
  });
}

/**
 * POST /api/admin/instagram/token
 * Actions: "exchange" (code → token) or "refresh" (refresh existing token)
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { action, code } = await req.json();

  if (action === "exchange") {
    if (!code) {
      return NextResponse.json({ error: "Code obrigatorio" }, { status: 400 });
    }

    try {
      // Step 1: Exchange code for short-lived token
      const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: `${SITE_URL}/admin/instagram`,
          code,
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error_message) {
        return NextResponse.json({ error: tokenData.error_message }, { status: 400 });
      }

      const shortLivedToken = tokenData.access_token;
      const igUserId = tokenData.user_id;

      // Step 2: Exchange for long-lived token
      const longRes = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${FB_APP_SECRET}&access_token=${shortLivedToken}`
      );
      const longData = await longRes.json();

      if (longData.error) {
        return NextResponse.json({ error: longData.error.message }, { status: 400 });
      }

      const longLivedToken = longData.access_token;
      const expiresIn = longData.expires_in || 5184000; // 60 days default

      // Step 3: Get username
      const profileRes = await fetch(
        `https://graph.instagram.com/${igUserId}?fields=username&access_token=${longLivedToken}`
      );
      const profileData = await profileRes.json();

      // Step 4: Store in DB
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      const { error: upsertError } = await supabaseAdmin
        .from("instagram_token_store")
        .upsert({
          id: 1,
          access_token: longLivedToken,
          token_expires_at: expiresAt,
          ig_user_id: String(igUserId),
          ig_username: profileData.username || null,
          last_refreshed_at: new Date().toISOString(),
        });

      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        username: profileData.username,
        expiresAt,
      });
    } catch (err) {
      console.error("Token exchange error:", err);
      return NextResponse.json({ error: "Erro ao trocar token" }, { status: 500 });
    }
  }

  if (action === "refresh") {
    // Get current token
    const { data: tokenRow } = await supabaseAdmin
      .from("instagram_token_store")
      .select("access_token")
      .eq("id", 1)
      .single();

    if (!tokenRow) {
      return NextResponse.json({ error: "Nenhum token encontrado" }, { status: 404 });
    }

    try {
      const refreshRes = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${tokenRow.access_token}`
      );
      const refreshData = await refreshRes.json();

      if (refreshData.error) {
        return NextResponse.json({ error: refreshData.error.message }, { status: 400 });
      }

      const expiresIn = refreshData.expires_in || 5184000;
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      await supabaseAdmin
        .from("instagram_token_store")
        .update({
          access_token: refreshData.access_token,
          token_expires_at: expiresAt,
          last_refreshed_at: new Date().toISOString(),
        })
        .eq("id", 1);

      return NextResponse.json({ success: true, expiresAt });
    } catch (err) {
      console.error("Token refresh error:", err);
      return NextResponse.json({ error: "Erro ao renovar token" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Action invalida" }, { status: 400 });
}
