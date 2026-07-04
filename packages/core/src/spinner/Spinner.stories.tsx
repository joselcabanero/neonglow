import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner.js";

const meta: Meta<typeof Spinner> = { title: "Core/Spinner", component: Spinner };
export default meta;
export const Default: StoryObj<typeof Spinner> = {};
export const Large: StoryObj<typeof Spinner> = { args: { size: 32 } };
