import type {
  AdminIconName,
  AdminModuleDefinition,
  AdminModuleGroup,
  AdminModuleRegistry,
} from "./types";
import { ADMIN_MODULE_GROUPS } from "./types";
import { compareModules } from "./module-registry";

/** Pure permission check shared by navigation and server guards. */
export function permissionGranted(
  permissions: ReadonlySet<string> | readonly string[],
  required: string,
): boolean {
  return Array.isArray(permissions)
    ? (permissions as readonly string[]).includes(required)
    : (permissions as ReadonlySet<string>).has(required);
}

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  icon: AdminIconName;
  description: string;
};

export type NavigationGroup = {
  id: AdminModuleGroup;
  label: string;
  items: NavigationItem[];
};

const GROUP_LABELS: Record<AdminModuleGroup, string> = {
  content: "Content",
  library: "Library",
  system: "System",
};

export function moduleNavigationLabel(module: AdminModuleDefinition): string {
  return module.navigationLabel ?? module.title;
}

/**
 * Enabled modules the user may see, grouped and ordered.
 *
 * Hiding an item is a UX decision only. Every page and mutation re-checks the
 * same permission on the server.
 */
export function buildNavigation(
  registry: AdminModuleRegistry,
  permissions: ReadonlySet<string> | readonly string[],
): NavigationGroup[] {
  return ADMIN_MODULE_GROUPS.map((group) => ({
    id: group,
    label: GROUP_LABELS[group],
    items: registry.enabled
      .filter((module) => module.group === group)
      .filter((module) =>
        permissionGranted(permissions, module.requiredPermission),
      )
      .sort(compareModules)
      .map((module) => ({
        id: module.id,
        label: moduleNavigationLabel(module),
        href: module.basePath,
        icon: module.icon,
        description: module.description,
      })),
  })).filter((group) => group.items.length > 0);
}

export type Breadcrumb = {
  label: string;
  href?: string;
};

/**
 * Breadcrumbs are derived from the same registry as the sidebar, so a module
 * cannot appear in one and not the other.
 */
export function buildBreadcrumbs(
  registry: AdminModuleRegistry,
  permissions: ReadonlySet<string> | readonly string[],
  pathname: string,
): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: "Dashboard", href: registry.adminPath }];
  const clean = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const definition = registry.getByPath(clean);

  if (!definition) {
    return crumbs;
  }

  const allowed = permissionGranted(permissions, definition.requiredPermission);

  if (!allowed) {
    return crumbs;
  }

  crumbs.push({
    label: moduleNavigationLabel(definition),
    href: clean === definition.basePath ? undefined : definition.basePath,
  });

  if (clean !== definition.basePath) {
    const rest = clean
      .slice(definition.basePath.length)
      .replace(/^\/+/, "")
      .split("/")
      .filter(Boolean);

    let href = definition.basePath;

    for (const segment of rest) {
      href = `${href}/${segment}`;
      crumbs.push({
        label: humanizeSegment(segment),
        href: href === clean ? undefined : href,
      });
    }
  }

  return crumbs;
}

export function humanizeSegment(segment: string): string {
  if (/^\d+$/.test(segment)) {
    return `#${segment}`;
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
