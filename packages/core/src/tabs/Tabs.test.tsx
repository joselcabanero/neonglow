import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tabs } from "./Tabs.js";

const TABS = [
  { id: "overview", title: "Overview", panel: <p>Overview panel</p> },
  { id: "holdings", title: "Holdings", panel: <p>Holdings panel</p> },
  { id: "docs", title: "Documents", disabled: true, panel: <p>Docs panel</p> },
  { id: "cash", title: "Cashflows", panel: <p>Cash panel</p> },
];

describe("Tabs", () => {
  it("selects first tab by default and switches on click", async () => {
    render(<Tabs tabs={TABS} />);
    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Overview panel");
    await userEvent.click(screen.getByRole("tab", { name: "Holdings" }));
    expect(screen.getByRole("tabpanel").textContent).toBe("Holdings panel");
  });
  it("arrow keys move selection and skip disabled tabs", async () => {
    render(<Tabs tabs={TABS} />);
    const first = screen.getByRole("tab", { name: "Overview" });
    first.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}"); // Holdings, then skip Documents -> Cashflows
    expect(screen.getByRole("tab", { name: "Cashflows" }).getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{ArrowRight}"); // wraps to Overview
    expect(first.getAttribute("aria-selected")).toBe("true");
  });
  it("controlled mode reports without switching", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} selectedId="overview" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Holdings" }));
    expect(onChange).toHaveBeenCalledWith("holdings");
    expect(screen.getByRole("tabpanel").textContent).toBe("Overview panel");
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tabs tabs={TABS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
