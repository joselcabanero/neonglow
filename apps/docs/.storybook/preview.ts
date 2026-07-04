import type { Preview } from "@storybook/react";
import "@neonglow/tokens/fonts.css";
import "@neonglow/tokens/theme.css";
import "@neonglow/core/styles.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: { title: "Theme", items: ["light", "dark"], dynamicTitle: true },
    },
    density: {
      description: "Density",
      toolbar: { title: "Density", items: ["default", "compact"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "dark", density: "default" },
  decorators: [
    (Story, ctx) => {
      const root = document.documentElement;
      root.setAttribute("data-theme", ctx.globals.theme);
      root.setAttribute("data-density", ctx.globals.density);
      document.body.style.background = "var(--surface)";
      document.body.style.color = "var(--text-1)";
      document.body.style.fontFamily = "var(--font-sans)";
      return Story();
    },
  ],
  parameters: { layout: "padded" },
};
export default preview;
