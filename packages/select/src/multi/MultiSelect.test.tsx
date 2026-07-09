import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { MultiSelect } from "./MultiSelect.js";

const SECTORS = ["Agritech", "Foodtech", "Logistics"];
const base = { items: SECTORS, getItemLabel: (s: string) => s };

describe("MultiSelect", () => {
  it("selecting adds a tag and keeps the popover open", async () => {
    render(<MultiSelect {...base} placeholder="Sectors" />);
    await userEvent.click(screen.getByRole("button", { name: "Sectors" }));
    await userEvent.click(screen.getByRole("option", { name: "Foodtech" }));
    expect(screen.getByRole("listbox")).toBeTruthy();            // stays open
    expect(screen.getByRole("button", { name: "Remove Foodtech" })).toBeTruthy();           // tag rendered
  });
  it("clicking a selected option removes it (toggle)", async () => {
    const onChange = vi.fn();
    render(<MultiSelect {...base} defaultValues={["Agritech"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /select/i }));
    await userEvent.click(screen.getByRole("option", { name: /Agritech/ }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
  it("tag remove button removes the value", async () => {
    const onChange = vi.fn();
    render(<MultiSelect {...base} defaultValues={["Agritech", "Foodtech"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Agritech" }));
    expect(onChange).toHaveBeenCalledWith(["Foodtech"]);
  });
  it("Backspace in an empty query removes the last value", async () => {
    const onChange = vi.fn();
    render(<MultiSelect {...base} defaultValues={["Agritech", "Foodtech"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /select/i }));
    await userEvent.type(screen.getByRole("combobox"), "{Backspace}");
    expect(onChange).toHaveBeenCalledWith(["Agritech"]);
  });
  it("has no axe violations when open", async () => {
    const { baseElement } = render(<MultiSelect {...base} defaultValues={["Agritech"]} />);
    await userEvent.click(screen.getByRole("button", { name: /select/i }));
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
