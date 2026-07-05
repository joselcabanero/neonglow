import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { toaster } from "./toast-store.js";
import { Toaster } from "./Toaster.js";

beforeEach(() => {
  vi.useFakeTimers();
  toaster.clear();
});
afterEach(() => {
  // Guard: axe test calls vi.useRealTimers() mid-test; skip flush if already real
  try { vi.runOnlyPendingTimers(); } catch (_) { /* timers already real */ }
  vi.useRealTimers();
});

describe("toaster", () => {
  it("buffers shows fired before mount", () => {
    act(() => {
      toaster.show({ message: "Valuation saved", intent: "success" });
    });
    render(<Toaster />);
    expect(screen.getByRole("status").textContent).toContain("Valuation saved");
  });
  it("auto-dismisses after timeout", () => {
    render(<Toaster />);
    act(() => {
      toaster.show({ message: "Valuation saved", timeout: 3000 });
    });
    expect(screen.getByRole("status")).toBeTruthy();
    act(() => vi.advanceTimersByTime(3100));
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("danger uses role=alert; sticky when timeout 0", () => {
    render(<Toaster />);
    act(() => {
      toaster.show({ message: "Write-off recorded", intent: "danger", timeout: 0 });
    });
    expect(screen.getByRole("alert")).toBeTruthy();
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByRole("alert")).toBeTruthy();
  });
  it("dismiss(key) removes; caps at 5 visible", () => {
    render(<Toaster />);
    let firstKey = "";
    act(() => {
      firstKey = toaster.show({ message: "t1", timeout: 0 });
      for (let i = 2; i <= 6; i++) toaster.show({ message: `t${i}`, timeout: 0 });
    });
    expect(screen.getAllByRole("status").length).toBe(5); // t1 dropped (FIFO)
    expect(screen.queryByText("t1")).toBeNull();
    act(() => toaster.dismiss(firstKey)); // no-op, already dropped
    act(() => {
      toaster.clear();
    });
    expect(screen.queryAllByRole("status").length).toBe(0);
  });
  it("has no axe violations", async () => {
    render(<Toaster />);
    act(() => {
      toaster.show({ message: "Valuation saved", intent: "success", timeout: 0 });
    });
    // axe defers via setTimeout(0); frozen fake timers would deadlock it
    vi.useRealTimers();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
