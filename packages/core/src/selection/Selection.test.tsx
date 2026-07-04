import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Checkbox } from "./Checkbox.js";
import { Radio } from "./Radio.js";
import { Switch } from "./Switch.js";

describe("selection controls", () => {
  it("Checkbox toggles via label click and keyboard", async () => {
    render(<Checkbox label="Lead" />);
    const box = screen.getByRole("checkbox", { name: "Lead" });
    await userEvent.click(screen.getByText("Lead"));
    expect((box as HTMLInputElement).checked).toBe(true);
    box.focus();
    await userEvent.keyboard(" ");
    expect((box as HTMLInputElement).checked).toBe(false);
  });
  it("Checkbox supports indeterminate", () => {
    render(<Checkbox label="All" indeterminate />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);
  });
  it("Radios in a group are exclusive", async () => {
    render(<><Radio name="v" label="SPV" defaultChecked /><Radio name="v" label="Fund" /></>);
    await userEvent.click(screen.getByRole("radio", { name: "Fund" }));
    expect((screen.getByRole("radio", { name: "SPV" }) as HTMLInputElement).checked).toBe(false);
  });
  it("Switch exposes role=switch", async () => {
    render(<Switch label="Reserved" defaultChecked />);
    const sw = screen.getByRole("switch", { name: "Reserved" });
    expect((sw as HTMLInputElement).checked).toBe(true);
  });
  it("has no axe violations", async () => {
    const { container } = render(
      <><Checkbox label="Lead" /><Radio name="g" label="SPV" /><Switch label="Reserved" /></>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
