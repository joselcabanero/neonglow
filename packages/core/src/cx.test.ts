import { describe, it, expect } from "vitest";
import { cx } from "./cx.js";

describe("cx", () => {
  it("joins truthy parts with spaces", () => {
    expect(cx("a", false, "b", undefined, null, "c")).toBe("a b c");
  });
  it("returns empty string for no truthy parts", () => {
    expect(cx(false, undefined)).toBe("");
  });
});
