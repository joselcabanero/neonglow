import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Divider } from "./Divider.js";

describe("Divider", () => {
  it("renders a separator", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeTruthy();
  });
});
