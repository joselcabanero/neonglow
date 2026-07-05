import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Navbar, NavbarGroup, NavbarHeading, NavbarDivider } from "./Navbar.js";
import { Button } from "../button/Button.js";

describe("Navbar", () => {
  it("renders a banner with heading and groups", () => {
    render(
      <Navbar>
        <NavbarGroup>
          <NavbarHeading>neonglow</NavbarHeading>
          <NavbarDivider />
          <Button variant="ghost">Portfolio</Button>
        </NavbarGroup>
        <NavbarGroup align="right"><Button variant="primary">Commit capital</Button></NavbarGroup>
      </Navbar>
    );
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByText("neonglow")).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(
      <Navbar><NavbarGroup><NavbarHeading>neonglow</NavbarHeading></NavbarGroup></Navbar>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
