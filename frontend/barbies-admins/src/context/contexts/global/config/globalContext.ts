import { createContext } from "react";
import type { GlobalContextType } from "../types/globaltypes";

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);
