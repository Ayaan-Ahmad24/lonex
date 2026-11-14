export const instant = false;

import { Suspense } from "react";
import { requireAdminModule } from "@/admin/config/access";
import { getSiteSettings } from "@/admin/core/settings/service";
import { listMediaForSelect } from "@/admin/core/media/service";
import { PageHeader } from "@/admin/core/ui/page-header";
import { LoadingState } from "@/admin/core/ui/states";
import { settingsDefaults } from "@/admin/modules/settings/defaults";
import { SettingsForm } from "@/admin/modules/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Site settings"
        description="Typed public settings. Database credentials, authentication secrets and API keys are never stored in the CMS."
      />
      <Suspense fallback={<LoadingState rows={6} />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}

async function SettingsContent() {
  await requireAdminModule("settings");
  const [settings, media] = await Promise.all([
    getSiteSettings(settingsDefaults),
    listMediaForSelect(),
  ]);

  return (
    <SettingsForm
      settings={settings}
      mediaOptions={media.map((item) => ({ id: item.id, label: item.label }))}
    />
  );
}
