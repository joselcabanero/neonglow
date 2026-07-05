import type { HTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./navbar.module.css";

export function Navbar({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <header className={cx(styles.navbar, className)} {...rest} />;
}

export interface NavbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  align?: "left" | "right";
}

export function NavbarGroup({ align = "left", className, ...rest }: NavbarGroupProps) {
  return <div data-align={align} className={cx(styles.group, className)} {...rest} />;
}

export function NavbarHeading({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.heading, className)} {...rest} />;
}

export function NavbarDivider({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-hidden="true" className={cx(styles.divider, className)} {...rest} />;
}
