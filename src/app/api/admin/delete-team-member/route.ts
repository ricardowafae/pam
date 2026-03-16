import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * DELETE /api/admin/delete-team-member
 *
 * Deletes a team_members row and the associated auth user.
 *
 * Body: { id: string (team_member id) }
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID do membro é obrigatório." },
        { status: 400 }
      );
    }

    // 1. Get the team member to find user_id
    const { data: member, error: fetchError } = await supabaseAdmin
      .from("team_members")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !member) {
      return NextResponse.json(
        { error: "Membro não encontrado." },
        { status: 404 }
      );
    }

    // 2. Delete team_members row
    const { error: deleteError } = await supabaseAdmin
      .from("team_members")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[delete-team-member] delete error:", deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // 3. Delete auth user
    if (member.user_id) {
      const { error: authDeleteError } =
        await supabaseAdmin.auth.admin.deleteUser(member.user_id);

      if (authDeleteError) {
        console.error(
          "[delete-team-member] auth delete error:",
          authDeleteError
        );
        // Don't fail the request — the team_members row is already gone
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[delete-team-member]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
