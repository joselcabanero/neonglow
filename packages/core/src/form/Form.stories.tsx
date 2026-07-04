import type { Meta, StoryObj } from "@storybook/react";
import { FormGroup } from "./FormGroup.js";
import { TextInput } from "./TextInput.js";
import { NumericInput } from "./NumericInput.js";

const meta: Meta = { title: "Core/Form" };
export default meta;

export const Fields: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 560 }}>
      <FormGroup label="Fund" labelFor="fund">
        <TextInput id="fund" defaultValue="Foodtech Fund I" />
      </FormGroup>
      <FormGroup label="Ticket" labelFor="ticket" helperText="Euro sign prefix, capital magnitude suffix.">
        <NumericInput id="ticket" defaultValue="€250,000" />
      </FormGroup>
      <FormGroup label="Company" labelFor="co" helperText="Required." intent="danger">
        <TextInput id="co" intent="danger" placeholder="Missing" />
      </FormGroup>
    </div>
  ),
};
