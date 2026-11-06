import { describe, expect, it } from "vitest";
import {
  isHstsEnabled,
  isHttpsDeployment,
  parseServerEnv,
} from "@/lib/env";

const validEnv = {
  NODE_ENV: "test",
  MYSQL_HOST: "127.0.0.1",
  MYSQL_PORT: "3306",
  MYSQL_USER: "test-user",
  MYSQL_PASSWORD: "test-password",
  MYSQL_DATABASE: "test-db",
  BETTER_AUTH_SECRET: "x".repeat(64),
  BETTER_AUTH_URL: "http://localhost:3000",
} as NodeJS.ProcessEnv;

describe("typed environment validation", () => {
  it("parses and coerces valid values", () => {
    const env = parseServerEnv(validEnv);

    expect(env.MYSQL_PORT).toBe(3306);
    expect(env.MYSQL_HOST).toBe("127.0.0.1");
  });

  it("names invalid keys without printing values", () => {
    try {
      parseServerEnv({ ...validEnv, MYSQL_HOST: "", BETTER_AUTH_SECRET: "short" });
      throw new Error("expected parseServerEnv to throw");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      expect(message).toContain("MYSQL_HOST");
      expect(message).toContain("BETTER_AUTH_SECRET");
      expect(message).not.toContain("test-password");
      expect(message).not.toContain("short");
    }
  });

  it("rejects an invalid port and URL", () => {
    expect(() => parseServerEnv({ ...validEnv, MYSQL_PORT: "70000" })).toThrow(
      /MYSQL_PORT/,
    );
    expect(() =>
      parseServerEnv({ ...validEnv, BETTER_AUTH_URL: "not-a-url" }),
    ).toThrow(/BETTER_AUTH_URL/);
  });

  it("derives HTTPS and HSTS flags", () => {
    const httpEnv = parseServerEnv(validEnv);
    const httpsEnv = parseServerEnv({
      ...validEnv,
      BETTER_AUTH_URL: "https://lonex.example",
    });

    expect(isHttpsDeployment(httpEnv)).toBe(false);
    expect(isHstsEnabled(httpEnv)).toBe(false);
    expect(isHttpsDeployment(httpsEnv)).toBe(true);
    expect(isHstsEnabled(httpsEnv)).toBe(true);
    expect(
      isHstsEnabled(parseServerEnv({ ...validEnv, ENABLE_HSTS: "1" })),
    ).toBe(true);
  });
});
