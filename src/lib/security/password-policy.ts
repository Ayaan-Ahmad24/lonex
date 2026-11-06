/**
 * One password policy shared by the admin bootstrap CLI and Better Auth.
 *
 * Requirements: at least 12 characters, at most 128 characters, not blank,
 * not equal to the account's own email/name, and not a trivially repeated
 * string. Character-class rules are deliberately not imposed here; length is
 * the primary defence and matches current NIST guidance.
 */

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordPolicyReason =
  | "blank"
  | "too_short"
  | "too_long"
  | "same_as_identity"
  | "low_variety";

export type PasswordPolicyResult =
  | { ok: true }
  | { ok: false; reason: PasswordPolicyReason };

export type PasswordPolicyInput = {
  password: string;
  email?: string;
  name?: string;
};

function normalise(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function evaluatePassword({
  password,
  email,
  name,
}: PasswordPolicyInput): PasswordPolicyResult {
  if (password.trim().length === 0) {
    return { ok: false, reason: "blank" };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, reason: "too_short" };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, reason: "too_long" };
  }

  const lowerPassword = normalise(password);
  const normalisedEmail = normalise(email);
  const emailLocalPart = normalisedEmail.includes("@")
    ? normalisedEmail.split("@")[0]
    : normalisedEmail;
  const normalisedName = normalise(name);

  if (
    lowerPassword === normalisedEmail ||
    (emailLocalPart.length >= 3 && lowerPassword === emailLocalPart) ||
    (normalisedName.length >= 3 && lowerPassword === normalisedName)
  ) {
    return { ok: false, reason: "same_as_identity" };
  }

  // Rejects "aaaaaaaaaaaa", "abababababab", "111111111111", etc.
  if (new Set(password).size < 4) {
    return { ok: false, reason: "low_variety" };
  }

  return { ok: true };
}

export function passwordPolicyMessage(reason: PasswordPolicyReason): string {
  switch (reason) {
    case "blank":
      return "Password cannot be blank.";
    case "too_short":
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    case "too_long":
      return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
    case "same_as_identity":
      return "Password must not be the same as your name or email address.";
    case "low_variety":
      return "Password is too repetitive. Choose a less predictable password.";
  }
}

/**
 * Throws a user-facing error when the policy is not met.
 * Used by the interactive administrator bootstrap CLI.
 */
export function assertPasswordPolicy(input: PasswordPolicyInput): void {
  const result = evaluatePassword(input);

  if (!result.ok) {
    throw new Error(passwordPolicyMessage(result.reason));
  }
}
