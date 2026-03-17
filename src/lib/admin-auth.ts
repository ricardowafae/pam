import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verifies that the request comes from an authenticated admin user.
 *
 * Checks the Authorization header for a valid Supabase JWT,
 * then verifies the user exists in the team_members table.
 *
 * Returns { user, teamMember } on success or a NextResponse error.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<
  | { user: { id: string; email?: string }; teamMember: { id: string; role: string } }
  | NextResponse
> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Autenticacao obrigatoria" },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  // Verify the JWT with Supabase
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      { error: "Token invalido ou expirado" },
      { status: 401 }
    );
  }

  // Check that user is a team member (admin)
  const { data: teamMember, error: teamError } = await supabaseAdmin
    .from("team_members")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (teamError || !teamMember) {
    return NextResponse.json(
      { error: "Acesso restrito a administradores" },
      { status: 403 }
    );
  }

  return { user: { id: user.id, email: user.email }, teamMember };
}

/**
 * Helper to check if the result is a NextResponse (error) or auth data.
 */
export function isAuthError(
  result: Awaited<ReturnType<typeof requireAdmin>>
): result is NextResponse {
  return result instanceof NextResponse;
}
