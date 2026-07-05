import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tree, type TreeNode } from "./Tree.js";

const CONTENTS: TreeNode[] = [
  {
    id: "fund1", label: "Foodtech Fund I", isExpanded: true, secondaryLabel: "28",
    childNodes: [
      { id: "hedgehop", label: "Hedgehop", secondaryLabel: "14.58×", isSelected: true },
      { id: "nucaps", label: "Nucaps", secondaryLabel: "2.09×" },
    ],
  },
  { id: "spv", label: "Genesys SPV", secondaryLabel: "7", childNodes: [{ id: "cocuus", label: "Cocuus" }] },
];

describe("Tree", () => {
  it("renders visible nodes with tree semantics; collapsed children hidden", () => {
    render(<Tree contents={CONTENTS} />);
    expect(screen.getByRole("tree")).toBeTruthy();
    const fund = screen.getByRole("treeitem", { name: /Foodtech Fund I/ });
    expect(fund.getAttribute("aria-expanded")).toBe("true");
    expect(fund.getAttribute("aria-level")).toBe("1");
    expect(screen.getByRole("treeitem", { name: /Hedgehop/ }).getAttribute("aria-level")).toBe("2");
    expect(screen.getByRole("treeitem", { name: /Hedgehop/ }).getAttribute("aria-selected")).toBe("true");
    expect(screen.queryByRole("treeitem", { name: /Cocuus/ })).toBeNull();
  });
  it("chevron click on a collapsed node calls onNodeExpand with node and path", async () => {
    const onNodeExpand = vi.fn();
    render(<Tree contents={CONTENTS} onNodeExpand={onNodeExpand} />);
    const spv = screen.getByRole("treeitem", { name: /Genesys SPV/ });
    await userEvent.click(spv.querySelector("[data-tree-chevron]")!);
    expect(onNodeExpand).toHaveBeenCalledOnce();
    expect(onNodeExpand.mock.calls[0][0].id).toBe("spv");
    expect(onNodeExpand.mock.calls[0][1]).toEqual([1]);
  });
  it("chevron click on an expanded node calls onNodeCollapse", async () => {
    const onNodeCollapse = vi.fn();
    render(<Tree contents={CONTENTS} onNodeCollapse={onNodeCollapse} />);
    const fund = screen.getByRole("treeitem", { name: /Foodtech Fund I/ });
    await userEvent.click(fund.querySelector("[data-tree-chevron]")!);
    expect(onNodeCollapse.mock.calls[0][0].id).toBe("fund1");
  });
  it("row click calls onNodeClick with path", async () => {
    const onNodeClick = vi.fn();
    render(<Tree contents={CONTENTS} onNodeClick={onNodeClick} />);
    await userEvent.click(screen.getByText("Nucaps"));
    expect(onNodeClick.mock.calls[0][0].id).toBe("nucaps");
    expect(onNodeClick.mock.calls[0][1]).toEqual([0, 1]);
  });
  it("keyboard: Down moves, Right expands collapsed, Left collapses expanded", async () => {
    const onNodeExpand = vi.fn();
    const onNodeCollapse = vi.fn();
    render(<Tree contents={CONTENTS} onNodeExpand={onNodeExpand} onNodeCollapse={onNodeCollapse} />);
    const items = screen.getAllByRole("treeitem");
    items[0].focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(items[1]);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard("{ArrowLeft}");                 // expanded -> collapse
    expect(onNodeCollapse).toHaveBeenCalledOnce();
    const spv = screen.getByRole("treeitem", { name: /Genesys SPV/ });
    spv.focus();
    await userEvent.keyboard("{ArrowRight}");                // collapsed -> expand
    expect(onNodeExpand).toHaveBeenCalledOnce();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tree contents={CONTENTS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
