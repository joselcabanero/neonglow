import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tag } from "./Tag.js";

describe("Tag", () => {
  it("renders children with the intent class", () => {
    render(<Tag intent="success">2.09×</Tag>);
    expect(screen.getByText("2.09×").className).toContain("success");
  });
  it("renders a labelled remove button when onRemove given", async () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Agritech</Tag>);
    await userEvent.click(screen.getByRole("button", { name: "Remove Agritech" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tag intent="danger" onRemove={() => {}}>Written off</Tag>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
