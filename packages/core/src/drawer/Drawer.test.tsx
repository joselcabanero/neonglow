import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Drawer } from "./Drawer.js";

describe("Drawer", () => {
  it("renders open with the side class and custom size", () => {
    render(<Drawer isOpen onClose={() => {}} side="left" size="300px" title="Filters">Body</Drawer>);
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("left");
    expect(dialog.style.getPropertyValue("--drawer-size")).toBe("300px");
  });
  it("close button calls onClose", async () => {
    const onClose = vi.fn();
    render(<Drawer isOpen onClose={onClose} title="Filters">Body</Drawer>);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("has no axe violations", async () => {
    const { baseElement } = render(<Drawer isOpen onClose={() => {}} title="Filters">Body</Drawer>);
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
