import { describe, expect, it } from "vitest";
import { isSameOrigin } from "@/lib/origin";

function request(origin?: string): Request {
  const headers = new Headers();

  if (origin) {
    headers.set("origin", origin);
  }

  return new Request("http://localhost:3000/api/admin/users/x/deactivate", {
    method: "POST",
    headers,
  });
}

describe("isSameOrigin", () => {
  it("accepts a matching origin", () => {
    expect(
      isSameOrigin(request("https://lonex.example"), "https://lonex.example"),
    ).toBe(true);
  });

  it("rejects a mismatched origin", () => {
    expect(
      isSameOrigin(request("https://evil.example"), "https://lonex.example"),
    ).toBe(false);
  });

  it("rejects a missing Origin header", () => {
    expect(isSameOrigin(request(), "https://lonex.example")).toBe(false);
  });

  it("rejects when the configured base URL is missing or invalid", () => {
    expect(isSameOrigin(request("https://lonex.example"), undefined)).toBe(
      false,
    );
    expect(isSameOrigin(request("https://lonex.example"), "not a url")).toBe(
      false,
    );
  });

  it("compares origins, not paths", () => {
    expect(
      isSameOrigin(request("https://lonex.example"), "https://lonex.example/"),
    ).toBe(true);
  });
});
