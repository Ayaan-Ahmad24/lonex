import { describe, expect, it } from "vitest";
import { parseCategoryForm } from "@/admin/modules/categories/schema";
import type { CategoryInput } from "@/admin/modules/categories/schema";

describe("category priority validation", () => {
  it("accepts a valid positive priority", () => {
    const formData = new FormData();
    formData.set("name", "Test Category");
    formData.set("slug", "test-category");
    formData.set("sortOrder", "5");

    const result = parseCategoryForm(formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sortOrder).toBe(5);
    }
  });

  it("accepts a valid negative priority", () => {
    const formData = new FormData();
    formData.set("name", "Test Category");
    formData.set("slug", "test-category");
    formData.set("sortOrder", "-10");

    const result = parseCategoryForm(formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sortOrder).toBe(-10);
    }
  });

  it("defaults blank priority to 0", () => {
    const formData = new FormData();
    formData.set("name", "Test Category");
    formData.set("slug", "test-category");
    formData.set("sortOrder", "");

    const result = parseCategoryForm(formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sortOrder).toBe(0);
    }
  });

  it("rejects non-integer priority", () => {
    const formData = new FormData();
    formData.set("name", "Test Category");
    formData.set("slug", "test-category");
    formData.set("sortOrder", "abc");

    const result = parseCategoryForm(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.sortOrder).toContain("whole number");
    }
  });

  it("rejects decimal priority", () => {
    const formData = new FormData();
    formData.set("name", "Test Category");
    formData.set("slug", "test-category");
    formData.set("sortOrder", "3.5");

    const result = parseCategoryForm(formData);

    expect(result.ok).toBe(false);
  });

  it("rejects priority below range", () => {
    const formData = new FormData();
    formData.set("name", "Test Category");
    formData.set("slug", "test-category");
    formData.set("sortOrder", "-100001");

    const result = parseCategoryForm(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.sortOrder).toContain("between -100000 and 100000");
    }
  });

  it("rejects priority above range", () => {
    const formData = new FormData();
    formData.set("name", "Test Category");
    formData.set("slug", "test-category");
    formData.set("sortOrder", "100001");

    const result = parseCategoryForm(formData);

    expect(result.ok).toBe(false);
  });

  it("type-checks CategoryInput sortOrder as number", () => {
    const input: CategoryInput = {
      name: "Test",
      slug: "test",
      description: "",
      coverMediaId: null,
      status: "draft",
      sortOrder: 42,
    };

    expect(input.sortOrder).toBe(42);
  });
});
