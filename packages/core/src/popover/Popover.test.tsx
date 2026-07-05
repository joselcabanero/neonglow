import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Popover } from "./Popover.js";
import { Button } from "../button/Button.js";

describe("Popover", () => {
  it("opens on trigger click and closes on Escape", async () => {
    render(
      <Popover content={<p>Panel body</p>}>
        <Button>Open</Button>
      </Popover>
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Panel body")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByText("Panel body")).toBeNull();
  });
  it("closes on outside click", async () => {
    render(
      <div>
        <Popover content={<p>Panel body</p>}><Button>Open</Button></Popover>
        <button>Outside</button>
      </div>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Panel body")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByText("Panel body")).toBeNull();
  });
  it("supports controlled mode", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover content={<p>Panel body</p>} isOpen={false} onOpenChange={onOpenChange}>
        <Button>Open</Button>
      </Popover>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Panel body")).toBeNull(); // parent didn't flip it
    rerender(
      <Popover content={<p>Panel body</p>} isOpen={true} onOpenChange={onOpenChange}>
        <Button>Open</Button>
      </Popover>
    );
    expect(screen.getByText("Panel body")).toBeTruthy();
  });
  it("has no axe violations when open", async () => {
    const { baseElement } = render(
      <Popover content={<p>Panel body</p>} defaultIsOpen>
        <Button>Open</Button>
      </Popover>
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
