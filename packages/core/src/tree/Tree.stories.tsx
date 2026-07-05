import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IconCalendar, IconClock } from "@neonglow/icons";
import { Tree, type TreeNode } from "./Tree.js";

const meta: Meta<typeof Tree> = { title: "Core/Tree", component: Tree };
export default meta;

// Note: IconFolder / IconDoc not in the icon set; using IconCalendar / IconClock as visual stand-ins.
const INITIAL: TreeNode[] = [
  {
    id: "fund1", label: "Foodtech Acceleration Fund I", icon: <IconCalendar />, secondaryLabel: "28", isExpanded: true,
    childNodes: [
      { id: "hedgehop", label: "Hedgehop", icon: <IconClock />, secondaryLabel: "14.58×", isSelected: true },
      { id: "nucaps", label: "Nucaps", icon: <IconClock />, secondaryLabel: "2.09×" },
      { id: "innomy", label: "Innomy", icon: <IconClock />, secondaryLabel: "1.64×" },
    ],
  },
  {
    id: "spv", label: "Spain Foodtech Genesys SPV", icon: <IconCalendar />, secondaryLabel: "7",
    childNodes: [{ id: "cocuus", label: "Cocuus", icon: <IconClock />, secondaryLabel: "2.55×" }],
  },
];

function setExpanded(nodes: TreeNode[], path: number[], value: boolean): TreeNode[] {
  const [head, ...rest] = path;
  return nodes.map((n, i) =>
    i !== head ? n : rest.length
      ? { ...n, childNodes: setExpanded(n.childNodes ?? [], rest, value) }
      : { ...n, isExpanded: value }
  );
}

export const FundStructure: StoryObj = {
  render: function Render() {
    const [contents, setContents] = useState(INITIAL);
    return (
      <div style={{ maxWidth: 380 }}>
        <Tree
          contents={contents}
          onNodeExpand={(_n, path) => setContents((c) => setExpanded(c, path, true))}
          onNodeCollapse={(_n, path) => setContents((c) => setExpanded(c, path, false))}
        />
      </div>
    );
  },
};
