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
    // axe-core fires `setTimeout(resolve, 0)` inside every rule; with fully-
    // frozen fake timers that callback never runs and `await axe(...)` hangs.
    // shouldAdvanceTime makes the fake clock tick at real-time pace (1:1), so
    // axe's 0ms deferred resolves fire naturally during the async await.
    // advanceTimeDelta: 20 ms per real-ms tick is fine because the synchronous
    // timer-based tests don't yield to the event loop between their acts, so
    // no accidental early auto-dismissals can occur.
    fakeTimers: { shouldAdvanceTime: true, advanceTimeDelta: 20 },
  },
});
