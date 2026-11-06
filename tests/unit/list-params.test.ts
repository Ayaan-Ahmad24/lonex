import { describe, expect, it } from "vitest";
import {
  LIST_PAGE_SIZE,
  MAX_LIST_PAGE,
  buildListQuery,
  clampPage,
  pageCountFor,
  parseListParams,
} from "@/admin/core/crud/list-params";

const options = {
  allowedSorts: ["createdAt", "title"] as const,
  defaultSort: "createdAt",
  filterValues: {
    status: ["draft", "published"],
    role: ["administrator", "editor"],
  },
};

describe("list parameter parsing", () => {
  it("applies defaults for empty input", () => {
    expect(parseListParams({}, options)).toEqual({
      q: "",
      page: 1,
      pageSize: LIST_PAGE_SIZE,
      sort: "createdAt",
      direction: "desc",
      filters: { status: "", role: "" },
    });
  });

  it("accepts allowlisted sort and filter values", () => {
    const params = parseListParams(
      {
        q: "  solar  ",
        page: "2",
        sort: "title",
        direction: "asc",
        status: "published",
        role: "editor",
      },
      options,
    );

    expect(params).toMatchObject({
      q: "solar",
      page: 2,
      sort: "title",
      direction: "asc",
      filters: { status: "published", role: "editor" },
    });
  });

  it("falls back for unknown sort and filter values", () => {
    const params = parseListParams(
      { sort: "password_hash", status: "deleted; --", role: "root" },
      options,
    );

    expect(params.sort).toBe("createdAt");
    expect(params.filters).toEqual({ status: "", role: "" });
  });

  it("clamps page and page size into safe bounds", () => {
    expect(parseListParams({ page: "0" }, options).page).toBe(1);
    expect(parseListParams({ page: String(MAX_LIST_PAGE + 1) }, options).page).toBe(
      1,
    );
    expect(parseListParams({ page: "abc" }, options).page).toBe(1);
    expect(parseListParams({ pageSize: "1000" }, options).pageSize).toBe(
      LIST_PAGE_SIZE,
    );
  });

  it("takes the first value when a parameter is repeated", () => {
    const params = parseListParams({ q: ["first", "second"] }, options);

    expect(params.q).toBe("first");
  });

  it("caps search length", () => {
    const params = parseListParams({ q: "x".repeat(500) }, options);

    expect(params.q.length).toBeLessThanOrEqual(200);
  });
});

describe("pagination helpers", () => {
  it("computes page counts with an empty minimum", () => {
    expect(pageCountFor(0, 10)).toBe(1);
    expect(pageCountFor(1, 10)).toBe(1);
    expect(pageCountFor(10, 10)).toBe(1);
    expect(pageCountFor(11, 10)).toBe(2);
  });

  it("clamps a page to the available range", () => {
    expect(clampPage(5, 11, 10)).toBe(2);
    expect(clampPage(1, 11, 10)).toBe(1);
    expect(clampPage(3, 0, 10)).toBe(1);
  });
});

describe("list query building", () => {
  it("preserves existing state and applies changes", () => {
    const query = buildListQuery(
      { q: "solar", page: "2", status: "draft" },
      { page: 3, status: "" },
    );
    const params = new URLSearchParams(query);

    expect(params.get("q")).toBe("solar");
    expect(params.get("page")).toBe("3");
    expect(params.has("status")).toBe(false);
  });

  it("returns an empty string when everything is cleared", () => {
    expect(buildListQuery({}, { q: "", page: undefined })).toBe("");
  });
});
