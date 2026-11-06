import Link from "next/link";
import { Card, CardBody } from "@/admin/core/ui/card";
import { buttonClassName } from "@/admin/core/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <Card>
        <CardBody className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Error 403
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            You do not have access
          </h1>
          <p className="text-sm text-slate-600">
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
