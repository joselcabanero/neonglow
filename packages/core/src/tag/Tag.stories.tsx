import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./Tag.js";

const meta: Meta<typeof Tag> = { title: "Core/Tag", component: Tag };
export default meta;

export const Intents: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tag accent>Exited</Tag>
      <Tag intent="success">2.09×</Tag>
      <Tag intent="info">Active</Tag>
      <Tag intent="warning">At cost</Tag>
      <Tag intent="danger">Written off</Tag>
      <Tag onRemove={() => {}}>Agritech</Tag>
    </div>
  ),
};
