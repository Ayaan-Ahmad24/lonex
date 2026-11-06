import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/rbac";
import { selectActiveUser } from "@/lib/session";

describe("active-user rule", () => {
  it("returns null without a session", () => {
    expect(selectActiveUser(null)).toBeNull();
    expect(selectActiveUser(undefined)).toBeNull();
  });

  it("returns null for an inactive user", () => {
    expect(selectActiveUser({ user: { id: "u1", isActive: false } })).toBeNull();
  });

  it("returns an active user", () => {
    expect(selectActiveUser({ user: { id: "u1", isActive: true } })).toEqual({
      id: "u1",
      isActive: true,
    });
  });

  it("treats a missing isActive flag as inactive", () => {
    const user: { id: string; isActive?: boolean } = { id: "u1" };

    expect(selectActiveUser({ user })).toBeNull();
  });
});

describe("permission rule", () => {
  it("checks Sets and arrays", () => {
    expect(hasPermission(new Set(["users.manage"]), "users.manage")).toBe(true);
    expect(hasPermission(new Set(["content.edit"]), "users.manage")).toBe(
      false,
    );
    expect(hasPermission(["users.manage"], "users.manage")).toBe(true);
    expect(hasPermission([], "users.manage")).toBe(false);
  });
});
