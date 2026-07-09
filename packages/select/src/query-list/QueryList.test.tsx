import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { QueryList } from "./QueryList.js";
import { highlightQuery } from "./highlightQuery.js";

interface Holding { name: string; sector: string; disabled?: boolean }
const HOLDINGS: Holding[] = [
  { name: "Hedgehop", sector: "Agritech" },
  { name: "Nucaps", sector: "Foodtech" },
  { name: "Innomy", sector: "Foodtech", disabled: true },
  { name: "Cocuus", sector: "Foodtech" },
];
const base = {
  items: HOLDINGS,
  getItemLabel: (h: Holding) => h.name,
  itemDisabled: (h: Holding) => !!h.disabled,
};

describe("QueryList", () => {
  it("filters by label (case-insensitive) as the query changes", async () => {
    render(<QueryList {...base} onItemSelect={() => {}} />);
    await userEvent.type(screen.getByRole("combobox"), "c");
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Nucaps", "Cocuus"]);
  });
  it("supports a custom itemPredicate", async () => {
    render(
      <QueryList {...base} itemPredicate={(q, h) => h.sector.toLowerCase().includes(q.toLowerCase())} onItemSelect={() => {}} />
    );
    await userEvent.type(screen.getByRole("combobox"), "agri");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Hedgehop"]);
  });
  it("arrow keys move the active descendant, skipping disabled and wrapping", async () => {
    render(<QueryList {...base} onItemSelect={() => {}} />);
    const input = screen.getByRole("combobox");
    const idOf = (name: string) =>
      screen.getByRole("option", { name }).id;
    expect(input.getAttribute("aria-activedescendant")).toBe(idOf("Hedgehop"));
    await userEvent.type(input, "{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).toBe(idOf("Nucaps"));
    await userEvent.type(input, "{ArrowDown}");            // skips disabled Innomy
    expect(input.getAttribute("aria-activedescendant")).toBe(idOf("Cocuus"));
    await userEvent.type(input, "{ArrowDown}");            // wraps
    expect(input.getAttribute("aria-activedescendant")).toBe(idOf("Hedgehop"));
  });
  it("Enter selects the active item", async () => {
    const onItemSelect = vi.fn();
    render(<QueryList {...base} onItemSelect={onItemSelect} />);
    await userEvent.type(screen.getByRole("combobox"), "{ArrowDown}{Enter}");
    expect(onItemSelect).toHaveBeenCalledWith(HOLDINGS[1]);
  });
  it("marks selected items with aria-selected and a checkmark", () => {
    const { container } = render(
      <QueryList {...base} selected={[HOLDINGS[0]]} onItemSelect={() => {}} />
    );
    const opt = screen.getByRole("option", { name: /Hedgehop/ });
    expect(opt.getAttribute("aria-selected")).toBe("true");
    expect(container.querySelector('[data-icon="check"]')).toBeTruthy();
  });
  it("shows noResults when nothing matches", async () => {
    render(<QueryList {...base} onItemSelect={() => {}} noResults={<span>Zero holdings.</span>} />);
    await userEvent.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("Zero holdings.")).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
  it("highlightQuery wraps the first match in a mark", () => {
    const { container } = render(<span>{highlightQuery("Hedgehop", "hop")}</span>);
    expect(container.querySelector("mark")?.textContent).toBe("hop");
    expect(container.textContent).toBe("Hedgehop");
  });
  it("initial active descendant skips a disabled first item", () => {
    const items = [{ name: "Innomy", sector: "Foodtech", disabled: true }, { name: "Nucaps", sector: "Foodtech" }];
    render(<QueryList items={items} getItemLabel={(h) => h.name} itemDisabled={(h) => !!h.disabled} onItemSelect={() => {}} />);
    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: "Nucaps" }).id);
  });
  it("has no axe violations", async () => {
    const { container } = render(<QueryList {...base} onItemSelect={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
