import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/instagram/competitors
 * List all competitors with their recent posts
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { data, error } = await supabaseAdmin
    .from("instagram_competitors")
    .select(`
      *,
      competitor_posts (
        id, post_type, caption_preview, permalink, likes, comments, posted_at
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competitors: data });
}

/**
 * POST /api/admin/instagram/competitors
 * Create or update a competitor
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const {
    id, handle, display_name, follower_count, following_count,
    media_count, avg_likes, avg_comments, engagement_rate,
    posting_frequency, notes, profile_pic_url,
  } = body;

  const record: Record<string, unknown> = {
    handle: handle?.replace("@", "") || null,
    display_name: display_name || null,
    profile_pic_url: profile_pic_url || null,
    follower_count: follower_count || 0,
    following_count: following_count || 0,
    media_count: media_count || 0,
    avg_likes: avg_likes || 0,
    avg_comments: avg_comments || 0,
    engagement_rate: engagement_rate || 0,
    posting_frequency: posting_frequency || 0,
    notes: notes || null,
    last_synced_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await supabaseAdmin
      .from("instagram_competitors")
      .update(record)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ competitor: data });
  } else {
    const { data, error } = await supabaseAdmin
      .from("instagram_competitors")
      .insert(record)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ competitor: data }, { status: 201 });
  }
}

/**
 * DELETE /api/admin/instagram/competitors
 * Soft-delete a competitor
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("instagram_competitors")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
