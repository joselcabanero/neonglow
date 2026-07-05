import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumbs, Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading,
  NonIdealState, Tabs, Tag, Tree,
} from "@neonglow/core";
import { IconSearch } from "@neonglow/icons";

const meta: Meta = { title: "Core/App shell" };
export default meta;

export const PortfolioWorkbench: StoryObj = {
  render: () => (
    <div style={{ border: "1px solid var(--border-hairline)" }}>
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
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        <Tree
          contents={[
            {
              id: "f1", label: "Foodtech Fund I", secondaryLabel: "28", isExpanded: true,
              childNodes: [
                { id: "h", label: "Hedgehop", secondaryLabel: "14.58×", isSelected: true },
                { id: "n", label: "Nucaps", secondaryLabel: "2.09×" },
              ],
            },
          ]}
        />
        <div>
          <Breadcrumbs items={[{ text: "Funds", href: "#" }, { text: "Foodtech I", href: "#" }, { text: "Hedgehop" }]} />
          <div style={{ marginTop: 12 }}>
            <Tabs
              tabs={[
                { id: "o", title: "Overview", panel: <p>Entry Jul 2020 · Exit Dec 2022 · 29 months hold · 14.58×.</p> },
                {
                  id: "d", title: "Documents",
                  panel: (
                    <NonIdealState
                      icon={<IconSearch size={20} />}
                      title="No documents yet"
                      description="Upload the investment memo to complete this holding."
                      action={<Button>Upload memo</Button>}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
