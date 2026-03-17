import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/instagram/posts
 * List all instagram posts with optional filters
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const postType = searchParams.get("post_type");

  let query = supabaseAdmin
    .from("instagram_posts")
    .select("*")
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (postType) query = query.eq("post_type", postType);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}

/**
 * POST /api/admin/instagram/posts
 * Create or update an instagram post
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { id, caption, post_type, status, platform, scheduled_at, tags, notes, media_urls } = body;

  const record: Record<string, unknown> = {
    caption: caption || null,
    post_type: post_type || "single_image",
    status: status || "idea",
    platform: platform || "instagram",
    scheduled_at: scheduled_at || null,
    tags: tags || [],
    notes: notes || null,
    media_urls: media_urls || [],
  };

  if (id) {
    // Update existing
    const { data, error } = await supabaseAdmin
      .from("instagram_posts")
      .update(record)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ post: data });
  } else {
    // Create new
    record.created_by = auth.user.id;
    const { data, error } = await supabaseAdmin
      .from("instagram_posts")
      .insert(record)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ post: data }, { status: 201 });
  }
}

/**
 * DELETE /api/admin/instagram/posts
 * Archive (soft-delete) a post
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("instagram_posts")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
