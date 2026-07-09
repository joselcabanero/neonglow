import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Suggest } from "./Suggest.js";

const NAMES = ["Hedgehop", "Nucaps", "Innomy", "Cocuus"];
const base = { items: NAMES, getItemLabel: (s: string) => s };

describe("Suggest", () => {
  it("typing opens the list and filters", async () => {
    render(<Suggest {...base} placeholder="Company" />);
    await userEvent.type(screen.getByRole("combobox"), "c");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Nucaps", "Cocuus"]);
  });
  it("Enter selects the active item, fills the input and closes", async () => {
    const onChange = vi.fn();
    render(<Suggest {...base} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "hedge{Enter}");
    expect(onChange).toHaveBeenCalledWith("Hedgehop");
    expect((input as HTMLInputElement).value).toBe("Hedgehop");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("clicking an option selects it", async () => {
    const onChange = vi.fn();
    render(<Suggest {...base} onChange={onChange} />);
    await userEvent.type(screen.getByRole("combobox"), "nu");
    await userEvent.click(screen.getAllByRole("option")[0]);
    expect(onChange).toHaveBeenCalledWith("Nucaps");
  });
  it("has no axe violations while open", async () => {
    const { container } = render(<Suggest {...base} ariaLabel="Search" />);
    await userEvent.type(screen.getByRole("combobox"), "o");
    expect(await axe(container)).toHaveNoViolations();
  });
});
