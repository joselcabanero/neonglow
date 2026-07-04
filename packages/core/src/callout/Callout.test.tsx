import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Callout } from "./Callout.js";

describe("Callout", () => {
  it("renders title, body and the intent icon", () => {
    const { container } = render(
      <Callout intent="warning" title="Held at cost">No fresh round in 18 months.</Callout>
    );
    expect(screen.getByText("Held at cost")).toBeTruthy();
    expect(container.querySelector('[data-icon="warning"]')).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Callout intent="danger" title="Write-off recorded">One position closed.</Callout>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
