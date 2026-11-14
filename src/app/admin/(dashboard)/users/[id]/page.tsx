export const instant = false;

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminModule } from "@/admin/config/access";
import { userIdSchema } from "@/lib/validation/schemas";
import { ActionForm } from "@/admin/core/ui/action-form";
import { FormField, Select } from "@/admin/core/ui/form-fields";
import { SubmitButton } from "@/admin/core/ui/submit-button";
import { ConfirmSubmitButton } from "@/admin/core/ui/confirm-dialog";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { PageHeader } from "@/admin/core/ui/page-header";
import { Badge, StatusBadge } from "@/admin/core/ui/badge";
import { buttonClassName } from "@/admin/core/ui/button";
import { formatDateTime } from "@/admin/core/ui/format";
import { DeleteForm } from "@/admin/modules/shared/delete-form";
import { getUserDetail } from "@/admin/modules/users/queries";
import {
  deactivateUserAction,
  deleteUserAction,
  reactivateUserAction,
  updateUserRoleAction,
} from "@/admin/modules/users/actions";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user: actor } = await requireAdminModule("users");
  const { id } = await params;
  const parsed = userIdSchema.safeParse(id);

  if (!parsed.success) {
    notFound();
  }

  const detail = await getUserDetail(parsed.data);

  if (!detail) {
    notFound();
  }

  const isSelf = detail.id === actor.id;
  const primaryRole = detail.roles[0] ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.name}
        description={detail.email}
        actions={
          <Link
            href="/admin/users"
            className={buttonClassName("secondary", "sm")}
          >
            Back to users
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Account" description="Provisioned outside the dashboard." />
          <CardBody className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-lonex-muted">Name</dt>
                <dd className="text-sm font-medium text-lonex-ink">
                  {detail.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-lonex-muted">Email</dt>
                <dd className="break-all text-sm font-medium text-lonex-ink">
                  {detail.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-lonex-muted">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={detail.isActive ? "active" : "inactive"} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-lonex-muted">Roles</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {detail.roles.length > 0 ? (
                    detail.roles.map((role) => (
                      <Badge
                        key={role}
                        tone={role === "administrator" ? "info" : "neutral"}
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-lonex-muted">No role</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-lonex-muted">Created</dt>
                <dd className="text-sm text-lonex-muted">
                  {formatDateTime(detail.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-lonex-muted">Active sessions</dt>
                <dd className="text-sm text-lonex-muted">{detail.sessionCount}</dd>
              </div>
            </dl>

            {isSelf ? (
              <p className="rounded-xl border border-lonex-line bg-lonex-line-soft px-3 py-2 text-xs text-lonex-muted">
                This is your own account. Self-deactivation and self role changes
                are blocked to prevent lockout.
              </p>
            ) : null}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Account status" />
            <CardBody className="space-y-3">
              {detail.isActive ? (
                isSelf ? (
                  <p className="text-sm text-lonex-muted">
                    You cannot deactivate your own account.
                  </p>
                ) : (
                  <ActionForm action={deactivateUserAction}>
                    <input type="hidden" name="id" value={detail.id} />
                    <p className="mb-3 text-sm text-lonex-muted">
                      Deactivation revokes every existing session immediately.
                    </p>
                    <ConfirmSubmitButton
                      label="Deactivate user"
                      confirmTitle="Deactivate this user?"
                      confirmMessage={`${detail.name} will be signed out everywhere and cannot sign in again until reactivated.`}
                      confirmLabel="Deactivate"
                    />
                  </ActionForm>
                )
              ) : (
                <ActionForm action={reactivateUserAction}>
                  <input type="hidden" name="id" value={detail.id} />
                  <p className="mb-3 text-sm text-lonex-muted">
                    Reactivation allows this account to sign in again. The
                    password is unchanged.
                  </p>
                  <SubmitButton label="Reactivate user" />
                </ActionForm>
              )}
            </CardBody>
          </Card>

          {!isSelf ? (
            <>
              <Card>
                <CardHeader
                  title="Role"
                  description="Role changes are audited transactionally."
                />
                <CardBody>
                  <ActionForm action={updateUserRoleAction} className="space-y-3">
                    <input type="hidden" name="id" value={detail.id} />
                    <FormField label="Role" htmlFor="role">
                      <Select id="role" name="role" defaultValue={primaryRole}>
                        <option value="administrator">Administrator</option>
                        <option value="editor">Editor</option>
                      </Select>
                    </FormField>
                    <ConfirmSubmitButton
                      label="Update role"
                      confirmTitle="Change this user's role?"
                      confirmMessage="Permissions take effect on the next request. The last active administrator cannot be demoted."
                      confirmLabel="Update role"
                      variant="primary"
                      size="md"
                    />
                  </ActionForm>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Delete user"
                  description="Permanently removes the account and all sessions. Audit history is preserved."
                />
                <CardBody>
                  <DeleteForm
                    action={deleteUserAction}
                    id={detail.id}
                    label="Delete user"
                    confirmTitle={`Delete ${detail.name}?`}
                    confirmMessage={
                      "This permanently removes the account, revokes every session " +
                      "and deletes all identity records. The user's media, articles, " +
                      "settings and audit history are preserved with the user set " +
                      "to null. This cannot be undone."
                    }
                    confirmLabel="Delete permanently"
                  />
                </CardBody>
              </Card>
            </>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader
          title="Recent audit events"
          description="Read-only history for this account."
        />
        {detail.recentAudit.length === 0 ? (
          <CardBody>
            <p className="text-sm text-lonex-muted">No audit events yet.</p>
          </CardBody>
        ) : (
          <ul className="divide-y divide-lonex-line">
            {detail.recentAudit.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-3 px-6 py-3"
              >
                <span className="text-sm text-lonex-ink">{event.action}</span>
                <span className="text-xs text-lonex-muted">
                  {formatDateTime(event.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
