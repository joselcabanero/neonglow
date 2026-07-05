import type { Meta, StoryObj } from "@storybook/react";
import { Navbar, NavbarGroup, NavbarHeading, NavbarDivider } from "./Navbar.js";
import { Button } from "../button/Button.js";
import { Tag } from "../tag/Tag.js";

const meta: Meta<typeof Navbar> = { title: "Core/Navbar", component: Navbar };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <Navbar>
      <NavbarGroup>
        <NavbarHeading>neonglow</NavbarHeading>
        <NavbarDivider />
        <Button variant="ghost">Portfolio</Button>
        <Button variant="ghost">Cashflows</Button>
      </NavbarGroup>
      <NavbarGroup align="right">
        <Tag intent="success">1.47×</Tag>
        <Button variant="primary">Commit capital</Button>
      </NavbarGroup>
    </Navbar>
  ),
};
