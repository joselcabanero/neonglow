import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Select } from "./Select.js";

const SECTORS = ["Agritech", "Foodtech", "Logistics"];
const base = { items: SECTORS, getItemLabel: (s: string) => s };

describe("Select", () => {
  it("shows placeholder, opens, selects and closes", async () => {
    render(<Select {...base} placeholder="Pick a sector" />);
    const trigger = screen.getByRole("button", { name: /Pick a sector/ });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Foodtech" }));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("button", { name: /Foodtech/ })).toBeTruthy();
  });
  it("filters options via the panel input", async () => {
    render(<Select {...base} />);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.type(screen.getByRole("combobox"), "agri");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Agritech"]);
  });
  it("controlled: reports without changing", async () => {
    const onChange = vi.fn();
    render(<Select {...base} value="Agritech" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /Agritech/ }));
    await userEvent.click(screen.getByRole("option", { name: "Logistics" }));
    expect(onChange).toHaveBeenCalledWith("Logistics");
    expect(screen.getByRole("button", { name: /Agritech/ })).toBeTruthy();
  });
  it("disabled trigger does not open", async () => {
    render(<Select {...base} disabled placeholder="Pick" />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("has no axe violations when open", async () => {
    const { baseElement } = render(<Select {...base} />);
    await userEvent.click(screen.getByRole("button"));
    // Portal renders outside landmarks; region rule is a known overlay false-positive.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
