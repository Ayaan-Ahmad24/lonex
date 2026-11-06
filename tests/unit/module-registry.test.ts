import { describe, expect, it } from "vitest";
import {
  createModuleRegistry,
  compareModules,
} from "@/admin/core/registry/module-registry";
import {
  buildBreadcrumbs,
  buildNavigation,
  permissionGranted,
} from "@/admin/core/registry/navigation";
import type { AdminModuleDefinition } from "@/admin/core/registry/types";

function module(
  overrides: Partial<AdminModuleDefinition> & { id: string },
): AdminModuleDefinition {
  return {
    title: overrides.id,
    description: `${overrides.id} module`,
    basePath: `/admin/${overrides.id}`,
    icon: "pages",
    group: "content",
    order: 10,
    requiredPermission: "pages.edit",
    ...overrides,
  };
}

const modules: AdminModuleDefinition[] = [
  module({ id: "pages", order: 10 }),
  module({
    id: "media",
    basePath: "/admin/media",
    icon: "media",
    group: "library",
    order: 20,
    requiredPermission: "media.manage",
  }),
  module({
    id: "users",
    basePath: "/admin/users",
    icon: "users",
    group: "system",
    order: 30,
    requiredPermission: "users.manage",
  }),
];

describe("static module registry", () => {
  it("enables only allowlisted modules", () => {
    const registry = createModuleRegistry(modules, {
      adminPath: "/admin",
      enabledModules: ["pages", "users"],
    });

    expect(registry.enabled.map((item) => item.id)).toEqual(["pages", "users"]);
    expect(registry.isEnabled("media")).toBe(false);
    expect(registry.getEnabled("media")).toBeUndefined();
    expect(registry.get("media")?.id).toBe("media");
  });

  it("rejects duplicate ids", () => {
    expect(() =>
      createModuleRegistry([...modules, module({ id: "pages" })], {
        adminPath: "/admin",
        enabledModules: [],
      }),
    ).toThrow(/Duplicate module id/);
  });

  it("rejects duplicate and overlapping route roots", () => {
    expect(() =>
      createModuleRegistry(
        [
          ...modules,
          module({ id: "pages-child", basePath: "/admin/pages/settings" }),
        ],
        { adminPath: "/admin", enabledModules: [] },
      ),
    ).toThrow(/overlaps/);
  });

  it("rejects modules outside the admin path", () => {
    expect(() =>
      createModuleRegistry([module({ id: "outside", basePath: "/public" })], {
        adminPath: "/admin",
        enabledModules: [],
      }),
    ).toThrow(/must live below/);
  });

  it("rejects a module that claims the admin root itself", () => {
    expect(() =>
      createModuleRegistry([module({ id: "root", basePath: "/admin" })], {
        adminPath: "/admin",
        enabledModules: [],
      }),
    ).toThrow(/must live below/);
  });

  it("resolves the longest matching root", () => {
    const registry = createModuleRegistry(modules, {
      adminPath: "/admin",
      enabledModules: ["pages", "media"],
    });

    expect(registry.getByPath("/admin/media/12")?.id).toBe("media");
    expect(registry.getByPath("/admin/pages/new")?.id).toBe("pages");
    expect(registry.getByPath("/admin/unknown")).toBeUndefined();
    expect(registry.getByPath("/admin")).toBeUndefined();
  });

  it("does not match a disabled module by path", () => {
    const registry = createModuleRegistry(modules, {
      adminPath: "/admin",
      enabledModules: ["pages"],
    });

    expect(registry.getByPath("/admin/media")).toBeUndefined();
  });

  it("orders modules deterministically", () => {
    const sorted = [...modules].sort(compareModules);

    expect(sorted.map((item) => item.id)).toEqual(["pages", "media", "users"]);
  });
});

describe("navigation and breadcrumbs", () => {
  const registry = createModuleRegistry(modules, {
    adminPath: "/admin",
    enabledModules: ["pages", "media", "users"],
  });

  it("checks permissions from a set or an array", () => {
    expect(permissionGranted(new Set(["pages.edit"]), "pages.edit")).toBe(true);
    expect(permissionGranted(["pages.edit"], "pages.edit")).toBe(true);
    expect(permissionGranted(["media.manage"], "pages.edit")).toBe(false);
  });

  it("hides modules the user cannot use", () => {
    const groups = buildNavigation(registry, new Set(["pages.edit"]));

    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe("content");
    expect(groups[0].items.map((item) => item.id)).toEqual(["pages"]);
  });

  it("groups items in the static order", () => {
    const groups = buildNavigation(
      registry,
      new Set(["pages.edit", "media.manage", "users.manage"]),
    );

    expect(groups.map((group) => group.id)).toEqual([
      "content",
      "library",
      "system",
    ]);
  });

  it("returns dashboard only for an unknown route", () => {
    const crumbs = buildBreadcrumbs(
      registry,
      new Set(["pages.edit"]),
      "/admin/unknown",
    );

    expect(crumbs).toEqual([{ label: "Dashboard", href: "/admin" }]);
  });

  it("returns dashboard only when the module permission is missing", () => {
    const crumbs = buildBreadcrumbs(
      registry,
      new Set<string>(),
      "/admin/pages/5",
    );

    expect(crumbs).toHaveLength(1);
  });

  it("builds permission-aware nested breadcrumbs", () => {
    const crumbs = buildBreadcrumbs(
      registry,
      new Set(["pages.edit"]),
      "/admin/pages/12/preview",
    );

    expect(crumbs.map((crumb) => crumb.label)).toEqual([
      "Dashboard",
      "pages",
      "#12",
      "Preview",
    ]);
    expect(crumbs[0].href).toBe("/admin");
    expect(crumbs[crumbs.length - 1].href).toBeUndefined();
  });
});
