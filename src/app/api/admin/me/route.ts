import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

/**
 * GET /api/admin/me
 * Returns the authenticated admin user info.
 * Used by the login page to verify team_members access.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  return NextResponse.json({
    user: auth.user,
    teamMember: auth.teamMember,
  });
}
