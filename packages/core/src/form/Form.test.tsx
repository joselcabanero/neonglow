import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { FormGroup } from "./FormGroup.js";
import { TextInput } from "./TextInput.js";
import { TextArea } from "./TextArea.js";
import { NumericInput } from "./NumericInput.js";

describe("form controls", () => {
  it("FormGroup associates label with control", async () => {
    render(
      <FormGroup label="Fund" labelFor="fund">
        <TextInput id="fund" defaultValue="Foodtech Fund I" />
      </FormGroup>
    );
    const input = screen.getByLabelText("Fund");
    await userEvent.clear(input);
    await userEvent.type(input, "Genesys SPV");
    expect((input as HTMLInputElement).value).toBe("Genesys SPV");
  });
  it("intent=danger marks the input invalid", () => {
    render(<TextInput intent="danger" aria-label="Ticket" />);
    const input = screen.getByLabelText("Ticket");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("danger");
  });
  it("TextArea renders a multiline control", () => {
    render(<TextArea aria-label="Memo" rows={3} />);
    expect(screen.getByLabelText("Memo").tagName).toBe("TEXTAREA");
  });
  it("NumericInput defaults to decimal inputMode and mono", () => {
    render(<NumericInput aria-label="Ticket" defaultValue="€250,000" />);
    const input = screen.getByLabelText("Ticket");
    expect(input.getAttribute("inputmode")).toBe("decimal");
    expect(input.className).toContain("mono");
  });
  it("has no axe violations", async () => {
    const { container } = render(
      <FormGroup label="Fair value" labelFor="fv" helperText="Updates blended MOIC.">
        <NumericInput id="fv" defaultValue="€410,000" />
      </FormGroup>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
