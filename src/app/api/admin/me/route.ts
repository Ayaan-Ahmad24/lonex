import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserPermissionCodes } from "@/lib/rbac";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { status: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const permissions = Array.from(await getUserPermissionCodes(user.id)).sort();

  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email, permissions },
    { headers: { "Cache-Control": "no-store" } },
  );
}