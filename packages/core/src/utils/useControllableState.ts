import { useCallback, useState } from "react";

/** Standard controlled/uncontrolled state resolution. */
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
