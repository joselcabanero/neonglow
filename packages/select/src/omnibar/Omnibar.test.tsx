import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Omnibar } from "./Omnibar.js";

const NAMES = ["Hedgehop", "Nucaps", "Cocuus"];
const base = { items: NAMES, getItemLabel: (s: string) => s, onItemSelect: () => {} };

describe("Omnibar", () => {
  it("opens on mod+k", async () => {
    render(<Omnibar {...base} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });
  it("selecting an item fires the handler and closes", async () => {
    const onItemSelect = vi.fn();
    render(<Omnibar {...base} onItemSelect={onItemSelect} defaultIsOpen />);
    await userEvent.click(screen.getByRole("option", { name: /Nucaps/ }));
    expect(onItemSelect).toHaveBeenCalledWith("Nucaps");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("Escape (native cancel) closes", () => {
    render(<Omnibar {...base} defaultIsOpen />);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("query resets on reopen", async () => {
    render(<Omnibar {...base} defaultIsOpen />);
    await userEvent.type(screen.getByRole("combobox"), "hedge");
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
  it("has no axe violations when open", async () => {
    const { baseElement } = render(<Omnibar {...base} defaultIsOpen />);
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
