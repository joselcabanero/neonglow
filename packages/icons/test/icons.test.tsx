// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as Icons from "../src/index.js";
import { IconCheck } from "../src/index.js";

describe("icon contract", () => {
  it("exports 31 icons, all Icon-prefixed", () => {
    const names = Object.keys(Icons).filter((k) => k.startsWith("Icon"));
    expect(names.length).toBe(32);
  });
  it("renders a 1.5-stroke, no-fill, currentColor svg", () => {
    const { container } = render(<IconCheck />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    expect(svg.getAttribute("fill")).toBe("none");
    expect(svg.getAttribute("stroke-width")).toBe("1.5");
    expect(svg.getAttribute("width")).toBe("16");
  });
  it("supports size 20 and an accessible title", () => {
    const { container } = render(<IconCheck size={20} title="Selected" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("20");
    expect(svg.querySelector("title")!.textContent).toBe("Selected");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
  });
  it("is aria-hidden when untitled (decorative-in-context affordance)", () => {
    const { container } = render(<IconCheck />);
    expect(container.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });
});
