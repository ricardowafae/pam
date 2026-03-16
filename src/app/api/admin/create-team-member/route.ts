import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/create-team-member
 *
 * Creates an auth user via Supabase Admin and inserts a team_members row.
 *
 * Body: { email, password, name, role, ...team_member fields }
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, ...rest } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, senha e nome são obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

    if (authError) {
      console.error("[create-team-member] auth error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Insert team_members row
    const { data: member, error: memberError } = await supabaseAdmin
      .from("team_members")
      .insert({
        user_id: userId,
        name,
        email,
        role: role || "equipe",
        ...rest,
      })
      .select()
      .single();

    if (memberError) {
      console.error("[create-team-member] insert error:", memberError);
      // Try to clean up the auth user if team_members insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: memberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, member });
  } catch (err) {
    console.error("[create-team-member]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
