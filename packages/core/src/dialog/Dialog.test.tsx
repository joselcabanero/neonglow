import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Dialog } from "./Dialog.js";
import { Button } from "../button/Button.js";

describe("Dialog", () => {
  it("shows content when open, nothing when closed", () => {
    const { rerender } = render(<Dialog isOpen={false} onClose={() => {}} title="Record valuation">Body</Dialog>);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<Dialog isOpen onClose={() => {}} title="Record valuation">Body</Dialog>);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Record valuation" })).toBeTruthy();
  });
  it("close button calls onClose", async () => {
    const onClose = vi.fn();
    render(<Dialog isOpen onClose={onClose} title="Record valuation">Body</Dialog>);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("Escape (native cancel) calls onClose without unmanaged close", () => {
    const onClose = vi.fn();
    render(<Dialog isOpen onClose={onClose}>Body</Dialog>);
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("has no axe violations", async () => {
    const { baseElement } = render(
      <Dialog isOpen onClose={() => {}} title="Record valuation" actions={<Button variant="primary">Save valuation</Button>}>
        Set the Q4 2026 fair value.
      </Dialog>
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
