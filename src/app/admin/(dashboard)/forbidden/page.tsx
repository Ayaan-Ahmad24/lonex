import Link from "next/link";
import { Card, CardBody } from "@/admin/core/ui/card";
import { buttonClassName } from "@/admin/core/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <Card>
        <CardBody className="space-y-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lonex-muted">
            Error 403
          </p>
          <h1 className="text-lonex-ink">You do not have access</h1>
          <p className="text-sm leading-6 text-lonex-ink-soft">
            Your account is signed in, but it does not have the permission
            required for this module. Ask an administrator to review your role.
          </p>
          <Link href="/admin" className={buttonClassName("primary", "sm")}>
            Back to dashboard
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
