import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card.js";
import { Tag } from "../tag/Tag.js";

const meta: Meta<typeof Card> = { title: "Core/Card", component: Card };
export default meta;

export const WithHeader: StoryObj = {
  render: () => (
    <Card title="Fund structure" actions={<Tag>Tree</Tag>}>
      Across two vehicles, we have deployed €4.15M into 35 portfolio companies.
    </Card>
  ),
};
