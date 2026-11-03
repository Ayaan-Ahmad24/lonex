import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { session, user } from "@/db/schema";
import { authorize } from "@/lib/rbac";
import { isSameOrigin } from "@/lib/origin";

const noStore = { "Cache-Control": "no-store" };

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorize("users.manage");

  if (!access.ok) {
    return NextResponse.json(
      { status: access.status === 401 ? "unauthorized" : "forbidden" },
      { status: access.status, headers: noStore },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { status: "forbidden" },
      { status: 403, headers: noStore },
    );
  }

  const { id } = await params;

  if (id === access.user.id) {
    return NextResponse.json(
      { status: "cannot_deactivate_self" },
      { status: 400, headers: noStore },
    );
  }

  const found = await db.transaction(async (tx) => {
    const [target] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!target) {
      return false;
    }

    await tx.update(user).set({ isActive: false }).where(eq(user.id, id));
    // Revoke every session so the user is signed out everywhere.
    await tx.delete(session).where(eq(session.userId, id));
    return true;
  });

  if (!found) {
    return NextResponse.json(
      { status: "not_found" },
      { status: 404, headers: noStore },
    );
  }

  return NextResponse.json({ status: "ok" }, { headers: noStore });
}