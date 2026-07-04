import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Card } from "./Card.js";

describe("Card", () => {
  it("renders title as a heading and children as content", () => {
    render(<Card title="Fund structure">28 holdings</Card>);
    expect(screen.getByRole("heading", { name: "Fund structure" })).toBeTruthy();
    expect(screen.getByText("28 holdings")).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Card title="Portfolio">Content</Card>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
