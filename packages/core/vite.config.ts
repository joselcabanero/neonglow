import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ include: ["src"], exclude: ["**/*.test.*", "**/*.stories.*"] })],
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: "index", cssFileName: "neonglow-core" },
    cssCodeSplit: false,
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "@neonglow/icons", "@floating-ui/react-dom"] },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
