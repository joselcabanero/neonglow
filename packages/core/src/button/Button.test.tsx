import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";

describe("Button", () => {
  it("renders an accessible button and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Commit capital</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Commit capital" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("defaults type=button and variant=secondary", () => {
    render(<Button>Save</Button>);
    const b = screen.getByRole("button");
    expect(b).toHaveProperty("type", "button");
    expect(b.className).toContain("secondary");
  });
  it("applies the variant class", () => {
    render(<Button variant="primary">Go</Button>);
    expect(screen.getByRole("button").className).toContain("primary");
  });
  it("disabled blocks clicks", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
  it("has no axe violations", async () => {
    const { container } = render(
      <ButtonGroup><Button variant="primary">Save</Button><Button>Cancel</Button></ButtonGroup>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
