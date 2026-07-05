import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Menu } from "./Menu.js";
import { MenuItem } from "./MenuItem.js";
import { MenuDivider } from "./MenuDivider.js";
import { Popover } from "../popover/Popover.js";
import { Button } from "../button/Button.js";

function sample(onSelect = vi.fn()) {
  return (
    <Menu aria-label="Holding actions">
      <MenuItem text="View holding" onSelect={onSelect} />
      <MenuItem text="Open memo" kbd="⌘O" />
      <MenuItem text="Reorder" disabled />
      <MenuDivider />
      <MenuItem text="Mark written off" intent="danger" />
    </Menu>
  );
}

describe("Menu", () => {
  it("navigates with arrows, skipping disabled items", async () => {
    render(sample());
    const items = screen.getAllByRole("menuitem");
    items[0].focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(items[1]);
    await userEvent.keyboard("{ArrowDown}");                 // skips disabled "Reorder"
    expect(document.activeElement).toBe(items[3]);
    await userEvent.keyboard("{ArrowDown}");                 // wraps
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(items[3]);
  });
  it("selects with Enter", async () => {
    const onSelect = vi.fn();
    render(sample(onSelect));
    screen.getAllByRole("menuitem")[0].focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
  });
  it("closes an enclosing Popover on select", async () => {
    render(
      <Popover defaultIsOpen content={<Menu aria-label="m"><MenuItem text="View holding" /></Menu>}>
        <Button>Actions</Button>
      </Popover>
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "View holding" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });
  it("has no axe violations", async () => {
    const { container } = render(sample());
    expect(await axe(container)).toHaveNoViolations();
  });
});
