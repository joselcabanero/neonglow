import type { Meta, StoryObj } from "@storybook/react";
import { IconEye, IconExternalLink, IconDragHandle, IconX } from "@neonglow/icons";
import { Menu } from "./Menu.js";
import { MenuItem } from "./MenuItem.js";
import { MenuDivider } from "./MenuDivider.js";

const meta: Meta<typeof Menu> = { title: "Core/Menu", component: Menu };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <Menu aria-label="Holding actions" style={{ border: "1px solid var(--border-hairline)" }}>
        <MenuItem icon={<IconEye />} text="View holding" kbd="⏎" />
        <MenuItem icon={<IconExternalLink />} text="Open memo" kbd="⌘O" />
        <MenuItem icon={<IconDragHandle />} text="Reorder" disabled />
        <MenuDivider />
        <MenuItem icon={<IconX />} text="Mark written off" intent="danger" />
      </Menu>
    </div>
  ),
};
