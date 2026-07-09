import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useControllableState } from "./useControllableState.js";

function Harness(props: { value?: string; onChange?: (v: string) => void }) {
  const [v, setV] = useControllableState({ value: props.value, defaultValue: "a", onChange: props.onChange });
  return <button onClick={() => setV("b")}>{v}</button>;
}

describe("useControllableState", () => {
  it("uncontrolled: starts at defaultValue and updates internally", () => {
    render(<Harness />);
    const b = screen.getByRole("button");
    expect(b.textContent).toBe("a");
    act(() => b.click());
    expect(b.textContent).toBe("b");
  });
  it("controlled: renders the prop and does not change without parent", () => {
    const onChange = vi.fn();
    render(<Harness value="ctrl" onChange={onChange} />);
    const b = screen.getByRole("button");
    act(() => b.click());
    expect(b.textContent).toBe("ctrl");
    expect(onChange).toHaveBeenCalledWith("b");
  });
  it("uncontrolled: still reports changes via onChange", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    act(() => screen.getByRole("button").click());
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
