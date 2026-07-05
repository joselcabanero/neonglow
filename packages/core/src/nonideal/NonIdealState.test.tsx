import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { IconSearch } from "@neonglow/icons";
import { NonIdealState } from "./NonIdealState.js";
import { Button } from "../button/Button.js";

describe("NonIdealState", () => {
  it("renders title, description and action", () => {
    render(
      <NonIdealState
        icon={<IconSearch size={20} />}
        title="No holdings match"
        description="Adjust the sector filter to see more companies."
        action={<Button>Clear filters</Button>}
      />
    );
    expect(screen.getByRole("heading", { name: "No holdings match" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<NonIdealState title="No holdings match" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
