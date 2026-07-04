import type { Meta, StoryObj } from "@storybook/react";
import {
  Button, ButtonGroup, Callout, Card, Checkbox, Divider, FormGroup,
  NumericInput, Radio, Spinner, Switch, Tag, TextInput, Tooltip,
} from "@neonglow/core";

const meta: Meta = { title: "Core/Kitchen sink" };
export default meta;

export const AllComponents: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
      <Card title="Portfolio — Foodtech Fund I" actions={<Tag accent>Exited</Tag>}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Tag intent="success">2.09×</Tag>
          <Tag intent="info">Active</Tag>
          <Tag intent="warning">At cost</Tag>
          <Tag intent="danger" onRemove={() => {}}>Written off</Tag>
        </div>
        <Divider />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 12 }}>
          <FormGroup label="Fund" labelFor="ks-fund">
            <TextInput id="ks-fund" defaultValue="Foodtech Fund I" />
          </FormGroup>
          <FormGroup label="Ticket" labelFor="ks-ticket">
            <NumericInput id="ks-ticket" defaultValue="€250,000" />
          </FormGroup>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center", margin: "12px 0", flexWrap: "wrap" }}>
          <Checkbox label="Lead" defaultChecked />
          <Radio name="ks-v" label="SPV" defaultChecked />
          <Radio name="ks-v" label="Fund" />
          <Switch label="Reserved" defaultChecked />
          <Spinner label="Recalculating" />
        </div>
        <ButtonGroup>
          <Tooltip content="Sets the Q4 2026 fair value">
            <Button variant="primary">Save valuation</Button>
          </Tooltip>
          <Button variant="ghost">Cancel</Button>
        </ButtonGroup>
      </Card>
      <Callout intent="success" title="Position marked up">
        Hedgehop crossed 1.2× — moved to the performance tint automatically.
      </Callout>
    </div>
  ),
};
