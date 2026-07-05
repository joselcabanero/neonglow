import { createContext } from "react";
export const PopoverContext = createContext<{ close: () => void } | null>(null);
