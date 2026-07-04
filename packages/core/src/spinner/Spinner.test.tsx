import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Spinner } from "./Spinner.js";

describe("Spinner", () => {
  it("is a labelled status region", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
  });
  it("accepts a custom label and size", () => {
    render(<Spinner label="Recalculating MOIC" size={32} />);
    const el = screen.getByRole("status", { name: "Recalculating MOIC" });
    expect(el.querySelector("svg")!.getAttribute("width")).toBe("32");
  });
  it("has no axe violations", async () => {
    const { container } = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
