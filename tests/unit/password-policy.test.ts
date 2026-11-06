import { describe, expect, it } from "vitest";
import {
  PASSWORD_MIN_LENGTH,
  assertPasswordPolicy,
  evaluatePassword,
  type PasswordPolicyInput,
  type PasswordPolicyReason,
} from "@/lib/security/password-policy";

function reason(input: PasswordPolicyInput): PasswordPolicyReason | "ok" {
  const result = evaluatePassword(input);

  return result.ok ? "ok" : result.reason;
}

describe("password policy", () => {
  it("accepts a 12+ character password", () => {
    expect(evaluatePassword({ password: "correct horse battery" })).toEqual({
      ok: true,
    });
  });

  it("accepts exactly the minimum length", () => {
    expect(evaluatePassword({ password: "aB3!dE6@hJ9#" }).ok).toBe(true);
    expect(PASSWORD_MIN_LENGTH).toBe(12);
  });

  it("rejects a 3-character password (SEC-02 regression)", () => {
    expect(evaluatePassword({ password: "abc" })).toEqual({
      ok: false,
      reason: "too_short",
    });
  });

  it("rejects 11 characters", () => {
    expect(reason({ password: "abcdefghijk" })).toBe("too_short");
  });

  it("rejects more than 128 characters", () => {
    expect(reason({ password: "a".repeat(129) })).toBe("too_long");
  });

  it("rejects blank and whitespace-only passwords", () => {
    expect(reason({ password: "" })).toBe("blank");
    expect(reason({ password: "            " })).toBe("blank");
  });

  it("rejects the account email and name", () => {
    const email = "admin@example.com";

    expect(reason({ password: "admin@example.com", email })).toBe(
      "same_as_identity",
    );
    expect(
      reason({ password: "administrator1", email, name: "administrator1" }),
    ).toBe("same_as_identity");
  });

  it("rejects a long email local part used as the password", () => {
    expect(
      reason({ password: "longlocalpart", email: "longlocalpart@example.com" }),
    ).toBe("same_as_identity");
  });

  it("rejects trivially repeated passwords", () => {
    expect(reason({ password: "aaaaaaaaaaaa" })).toBe("low_variety");
    expect(reason({ password: "abababababab" })).toBe("low_variety");
  });

  it("throws a user-facing message from assertPasswordPolicy", () => {
    expect(() => assertPasswordPolicy({ password: "abc" })).toThrow(
      /at least 12 characters/,
    );
  });
});
