import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "./TextInput.js";

/** Text input preconfigured for numeric/money entry: decimal inputMode, tabular mono. */
export const NumericInput = forwardRef<HTMLInputElement, TextInputProps>(function NumericInput(
  { mono = true, inputMode = "decimal", ...rest },
  ref
) {
  return <TextInput ref={ref} mono={mono} inputMode={inputMode} {...rest} />;
});
