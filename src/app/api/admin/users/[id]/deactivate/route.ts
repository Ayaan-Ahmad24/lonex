import { NextResponse } from "next/server";
import { authorize } from "@/lib/rbac";
import { isSameOrigin } from "@/lib/origin";
import { deactivateUserAtomic } from "@/lib/admin/deactivate-user";
import { deactivateUserParamsSchema } from "@/lib/validation/schemas";

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

  const parsed = deactivateUserParamsSchema.safeParse(await params);

  if (!parsed.success) {
    return NextResponse.json(
      { status: "invalid_id" },
      { status: 400, headers: noStore },
    );
  }

  const { id } = parsed.data;

  if (id === access.user.id) {
    return NextResponse.json(
      { status: "cannot_deactivate_self" },
      { status: 400, headers: noStore },
    );
  }

  const result = await deactivateUserAtomic({
    actorUserId: access.user.id,
    targetId: id,
  });

  if (result === "not_found") {
    return NextResponse.json(
      { status: "not_found" },
      { status: 404, headers: noStore },
    );
  }

  if (result === "last_administrator") {
    return NextResponse.json(
      { status: "last_administrator" },
      { status: 400, headers: noStore },
    );
  }

  return NextResponse.json({ status: "ok" }, { headers: noStore });
}
