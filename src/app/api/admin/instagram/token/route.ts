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
      // Step 1: Exchange code for user access token via Facebook Graph API
      const tokenRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          redirect_uri: `${SITE_URL}/admin/instagram`,
          code,
        })
      );

      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        console.error("FB token exchange error:", tokenData.error);
        return NextResponse.json({ error: tokenData.error.message || "Erro ao trocar codigo" }, { status: 400 });
      }

      const userAccessToken = tokenData.access_token;

      // Step 2: Exchange for long-lived user token
      const longRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: userAccessToken,
        })
      );
      const longData = await longRes.json();

      const longLivedToken = longData.access_token || userAccessToken;
      const expiresIn = longData.expires_in || 5184000; // 60 days default

      // Step 3: Get Facebook Pages the user manages
      const pagesRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?access_token=${longLivedToken}`
      );
      const pagesData = await pagesRes.json();

      if (!pagesData.data || pagesData.data.length === 0) {
        return NextResponse.json({ error: "Nenhuma pagina do Facebook encontrada" }, { status: 400 });
      }

      // Step 4: Find the Instagram Business Account connected to a page
      let igUserId = "";
      let igUsername = "";
      let pageAccessToken = "";

      for (const page of pagesData.data) {
        const igRes = await fetch(
          `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData = await igRes.json();

        if (igData.instagram_business_account) {
          igUserId = igData.instagram_business_account.id;
          pageAccessToken = page.access_token;

          // Get Instagram username
          const profileRes = await fetch(
            `https://graph.facebook.com/v21.0/${igUserId}?fields=username,name&access_token=${pageAccessToken}`
          );
          const profileData = await profileRes.json();
          igUsername = profileData.username || profileData.name || "";
          break;
        }
      }

      if (!igUserId) {
        return NextResponse.json({
          error: "Nenhuma conta do Instagram Business vinculada as suas paginas do Facebook",
        }, { status: 400 });
      }

      // Step 5: Store in DB (use page access token for Instagram API calls)
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      const { error: upsertError } = await supabaseAdmin
        .from("instagram_token_store")
        .upsert({
          id: 1,
          access_token: pageAccessToken,
          token_expires_at: expiresAt,
          ig_user_id: igUserId,
          ig_username: igUsername,
          last_refreshed_at: new Date().toISOString(),
        });

      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        username: igUsername,
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
      // Page tokens from Facebook Login for Business don't expire if the user granted permanent access
      // But we can try to refresh by re-fetching pages with the long-lived user token
      const refreshRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: tokenRow.access_token,
        })
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
