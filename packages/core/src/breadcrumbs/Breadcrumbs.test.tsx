import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Breadcrumbs } from "./Breadcrumbs.js";

const ITEMS = [
  { text: "Funds", href: "#funds" },
  { text: "Foodtech I", href: "#f1" },
  { text: "Portfolio" },
];

describe("Breadcrumbs", () => {
  it("marks the last item as the current page", () => {
    render(<Breadcrumbs items={ITEMS} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumbs" })).toBeTruthy();
    const current = screen.getByText("Portfolio");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Funds" })).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Breadcrumbs items={ITEMS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
