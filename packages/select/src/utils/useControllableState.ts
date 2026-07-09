import { useCallback, useState } from "react";

/**
 * Standard controlled/uncontrolled state resolution.
 * Deliberate copy of @neonglow/core's internal util — core keeps its utils private.
 */
export function useControllableState<T>(opts: {
  value?: T;
  defaultValue: T;
  onChange?: (v: T) => void;
}): [T, (v: T) => void] {
  const [internal, setInternal] = useState(opts.defaultValue);
  const isControlled = opts.value !== undefined;
  const value = isControlled ? (opts.value as T) : internal;
  const { onChange } = opts;
  const set = useCallback(
    (v: T) => {
      if (!isControlled) setInternal(v);
      onChange?.(v);
    },
    [isControlled, onChange]
  );
  return [value, set];
}
