import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Tooltip } from "./Tooltip.js";
import { Button } from "../button/Button.js";

describe("Tooltip", () => {
  it("describes its trigger via aria-describedby", () => {
    render(<Tooltip content="Blended across two vehicles"><Button>1.47×</Button></Tooltip>);
    const trigger = screen.getByRole("button", { name: "1.47×" });
    const tip = screen.getByRole("tooltip", { hidden: true });
    expect(trigger.getAttribute("aria-describedby")).toBe(tip.id);
    expect(tip.textContent).toBe("Blended across two vehicles");
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tooltip content="Help"><Button>Metric</Button></Tooltip>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
