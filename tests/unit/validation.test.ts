import { describe, expect, it } from "vitest";
import {
  deactivateUserParamsSchema,
  signInSchema,
  userIdSchema,
} from "@/lib/validation/schemas";

const validId = "11111111-1111-4111-8111-111111111111";

describe("Zod validation schemas", () => {
  it("accepts a UUID user id", () => {
    expect(userIdSchema.safeParse(validId).success).toBe(true);
    expect(deactivateUserParamsSchema.safeParse({ id: validId }).success).toBe(
      true,
    );
  });

  it("rejects a non-UUID user id", () => {
    expect(userIdSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(
      deactivateUserParamsSchema.safeParse({ id: "../../etc/passwd" }).success,
    ).toBe(false);
  });

  it("normalises the sign-in email without altering the password", () => {
    const parsed = signInSchema.parse({
      email: "  Admin@Example.COM ",
      password: "  secret  ",
    });

    expect(parsed.email).toBe("admin@example.com");
    // Passwords are not trimmed by the schema; only the email is normalised.
    expect(parsed.password).toBe("  secret  ");
  });

  it("rejects malformed sign-in input", () => {
    expect(
      signInSchema.safeParse({ email: "not-an-email", password: "x" }).success,
    ).toBe(false);
    expect(
      signInSchema.safeParse({ email: "a@b.co", password: "" }).success,
    ).toBe(false);
  });
});
