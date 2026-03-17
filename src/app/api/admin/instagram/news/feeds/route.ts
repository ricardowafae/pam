import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/instagram/news/feeds
 * List all RSS feeds
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { data, error } = await supabaseAdmin
    .from("news_feeds")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ feeds: data });
}

/**
 * POST /api/admin/instagram/news/feeds
 * Create or update a feed
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { id, name, url, topic, is_active } = body;

  if (id) {
    const { data, error } = await supabaseAdmin
      .from("news_feeds")
      .update({ name, url, topic: topic || "general", is_active: is_active ?? true })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ feed: data });
  } else {
    const { data, error } = await supabaseAdmin
      .from("news_feeds")
      .insert({ name, url, topic: topic || "general", is_active: is_active ?? true })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ feed: data }, { status: 201 });
  }
}

/**
 * DELETE /api/admin/instagram/news/feeds
 * Delete a feed and its articles
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("news_feeds")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
