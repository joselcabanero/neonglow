import type { ReactNode, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Icon grid: 16 (default) or 20 */
  size?: 16 | 20;
  /** Accessible name. Omit when the icon is a purely visual affordance. */
  title?: string;
}

export function createIcon(name: string, children: ReactNode) {
  function Icon({ size = 16, title, ...rest }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24" width={size} height={size}
        stroke="currentColor" fill="none" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden={title ? undefined : true}
        role={title ? "img" : undefined}
        data-icon={name}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {children}
      </svg>
    );
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}
